/*
  Copyright (c) 2017, F5 Networks, Inc.
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  *
  http://www.apache.org/licenses/LICENSE-2.0
  *
  Unless required by applicable law or agreed to in writing,
  software distributed under the License is distributed on an
  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
  either express or implied. See the License for the specific
  language governing permissions and limitations under the License.
  
  Updated by Ping Xiong on May/04/2022.
  Updated by Ping Xiong on Oct/09/2022, modify the polling signal into a json object to keep more information.
  let blockInstance = {
    name: "instanceName", // a block instance of the iapplx config
    state: "polling", // can be "polling" for normal running state; "update" to modify the iapplx config
    bigipPool: "/Common/samplePool"
  }
*/

'use strict';

// Middleware. May not be installed.
var configTaskUtil = require("./configTaskUtil");
var blockUtil = require("./blockUtils");
var logger = require('f5-logger').getInstance();
var mytmsh = require('./TmshUtil');
var fs = require('fs'); 

// Setup a polling signal for audit.
//const msdaetcdv3OnPollingSignal = '/var/tmp/msdaetcdv3OnPolling';
global.msdaetcdv3OnPolling = [];


//const pollInterval = 10000; // Interval for polling Registry registry.
//var stopPolling = false;

var poolMembers = '{100.100.100.100:8080 100.100.100.101:8080}';

/**
 * A dynamic config processor for managing LTM pools.
 * Note that the pool member name is not visible in the GUI. It is generated by MCP according to a pattern, we don't want
 * the user setting it
 *
 * @constructor
 */
function msdaetcdv3ConfigProcessor() {
}

msdaetcdv3ConfigProcessor.prototype.setModuleDependencies = function (options) {
    logger.info("setModuleDependencies called");
    configTaskUtil = options.configTaskUtil;
};

msdaetcdv3ConfigProcessor.prototype.WORKER_URI_PATH = "shared/iapp/processors/msdaetcdv3Config";

msdaetcdv3ConfigProcessor.prototype.onStart = function (success) {
    logger.fine("MSDA: OnStart, msdaetcdv3ConfigProcessor.prototype.onStart");
    this.apiStatus = this.API_STATUS.INTERNAL_ONLY;
    this.isPublic = true;

    configTaskUtil.initialize({
        restOperationFactory: this.restOperationFactory,
        eventChannel: this.eventChannel,
        restHelper: this.restHelper
    });

    const cpetcdctl = 'cp /var/config/rest/iapps/f5-iapplx-msda-etcdv3/nodejs/etcdctl /var/tmp/etcdctl';
    const chmodx = 'chmod +x /var/tmp/etcdctl';

    mytmsh.executeCommand(cpetcdctl).then(function () {
        return mytmsh.executeCommand(chmodx);
    }).then(function () {
        logger.fine('MSDA: OnStart, etcdctl ready.');
    }).catch(function (err) {
        logger.fine('MSDA: OnStart, failed to cp etcdctl file with error:', err.message);
    });

    success();
};


/**
 * Handles initial configuration or changed configuration. Sets the block to 'BOUND' on success
 * or 'ERROR' on failure. The routine is resilient in that it will try its best and always go
 * for the 'replace' all attitude.
 *
 * @param restOperation - originating rest operation that triggered this processor
 */
msdaetcdv3ConfigProcessor.prototype.onPost = function (restOperation) {
    var configTaskState,
        blockState,
        oThis = this;
    logger.fine("MSDA: onPost, msdaetcdv3ConfigProcessor.prototype.onPost");

    var instanceName;
    var inputProperties;
    var dataProperties;
    try {
        configTaskState = configTaskUtil.getAndValidateConfigTaskState(restOperation);
        blockState = configTaskState.block;
        logger.fine("MSDA: onPost, inputProperties ", blockState.inputProperties);
        logger.fine("MSDA: onPost, dataProperties ", blockState.dataProperties);
        logger.fine("MSDA: onPost, instanceName ", blockState.name);
        inputProperties = blockUtil.getMapFromPropertiesAndValidate(
            blockState.inputProperties,
            ["etcdv3Endpoint", "authenticationCert", "serviceName", "poolName", "poolType", "healthMonitor"]
        );
        dataProperties = blockUtil.getMapFromPropertiesAndValidate(
            blockState.dataProperties,
            ["pollInterval"]
        );
        instanceName = blockState.name;
    } catch (ex) {
        restOperation.fail(ex);
        return;
    }

    // Mark that the request meets all validity checks and tell the originator it was accepted.
    this.completeRequest(restOperation, this.wellKnownPorts.STATUS_ACCEPTED);

    // Generic URI components, minus the 'path'
    var uri = this.restHelper.buildUri({
        protocol: this.wellKnownPorts.DEFAULT_HTTP_SCHEME,
        port: this.wellKnownPorts.DEFAULT_JAVA_SERVER_PORT,
        hostname : "localhost"
    });

    //Accept input proterties, set the status to BOUND.

    const clientCrt64 = inputProperties.authenticationCert.value.etcdv3Cert;
    const clientKey64 = inputProperties.authenticationCert.value.etcdv3Key;
    const ca64 = inputProperties.authenticationCert.value.caCert;

    var clientKeyBuffer = Buffer.from(clientKey64, 'base64');
    var f5ClientKey = clientKeyBuffer.toString();
    fs.writeFile('/var/tmp/f5Client.key', f5ClientKey, function (err) {
        if (err) {
            throw err;
        }
    });

    var clientCrtBuffer = Buffer.from(clientCrt64, 'base64');
    var f5ClientCrt = clientCrtBuffer.toString();
    fs.writeFile('/var/tmp/f5Client.Crt', f5ClientCrt, function (err) {
        if (err) {
            throw err;
        }
    });

    var caBuffer = Buffer.from(ca64, 'base64');
    var etcdv3caCrt = caBuffer.toString();
    fs.writeFile('/var/tmp/etcdv3ca.Crt', etcdv3caCrt, function (err) {
        if (err) {
            throw err;
        }
    });

    const inputEndPoint = inputProperties.etcdv3Endpoint.value;
    const inputServiceName = inputProperties.serviceName.value;
    const inputPoolName = inputProperties.poolName.value;
    const inputPoolType = inputProperties.poolType.value;
    const inputMonitor = inputProperties.healthMonitor.value;
    var pollInterval = dataProperties.pollInterval.value * 1000;

    // Check the existence of the pool in BIG-IP, create an empty pool if the pool doesn't exist.
    mytmsh.executeCommand("tmsh -a list ltm pool " + inputPoolName)
    .then(function () {
        logger.fine(
          "MSDA: onPost, " +
            instanceName +
            " found the pool, no need to create an empty pool."
        );
        return;
    }, function (error) {
        logger.fine(
          "MSDA: onPost, " +
            instanceName +
            " GET of pool failed, adding an empty pool: " +
            inputPoolName
        );
        let inputEmptyPoolConfig = inputPoolName + ' monitor ' + inputMonitor + ' load-balancing-mode ' + inputPoolType + ' members none';
        let commandCreatePool = 'tmsh -a create ltm pool ' + inputEmptyPoolConfig;
        return mytmsh.executeCommand(commandCreatePool);
    })
    .catch(function (error) {
        logger.fine(
          "MSDA: onPost, " +
            instanceName +
            " list pool failed: ",
            error.message
        );
    });

    // Set the polling interval
    if (pollInterval) {
        if (pollInterval < 10000) {
            logger.fine(
              "MSDA: onPost, " +
                instanceName +
                " pollInternal is too short, will set it to 10s ",
              pollInterval
            );
            pollInterval = 10000;
        }
    } else {
        logger.fine(
          "MSDA: onPost, " +
            instanceName +
            " pollInternal is not set, will set it to 30s ",
          pollInterval
        );
        pollInterval = 30000;
    }

    // Setup the polling signal for audit and update


    let blockInstance = {
        name: instanceName,
        bigipPool: inputPoolName,
        state: "polling"
    };

    let signalIndex = global.msdaetcdv3OnPolling.findIndex(instance => instance.name === instanceName);
    if (signalIndex !== -1) {
        // Already has the instance, change the state into "update"
        global.msdaetcdv3OnPolling.splice(signalIndex, 1);
        blockInstance.state = "update";
    }
    logger.fine("MSDA: onPost, blockInstance:", blockInstance);

    // Setup a signal to identify existing polling loop
    var existingPollingLoop = false;

    // Check if there is a conflict bigipPool in configuration

    if (
        global.msdaetcdv3OnPolling.some(
            (instance) => instance.bigipPool === inputPoolName
        )
    ) {
        logger.fine(
            "MSDA: onPost, " +
            instanceName +
            " already has an instance polling the same pool, change BLOCK to ERROR: ",
            inputPoolName
        );
        try { 
            throw new Error("onPost: poolName conflict: " + inputPoolName + " , will set the BLOCK to ERROR state");
        } catch (error) {
            configTaskUtil.sendPatchToErrorState(
              configTaskState,
              error,
              oThis.getUri().href,
              restOperation.getBasicAuthorization()
            );
        }
        return;
    } else { 
        global.msdaetcdv3OnPolling.push(blockInstance);
        logger.fine(
          "MSDA onPost: " + instanceName + " set msdaetcdv3Onpolling signal: ",
          global.msdaetcdv3OnPolling
        );
    }
    
    logger.fine(
      "MSDA: onPost, " +
        instanceName +
        " Input properties accepted, change to BOUND status, start to poll Registry for: " +
        inputPoolName
    );

    //stopPolling = false;

    configTaskUtil.sendPatchToBoundState(configTaskState, 
            oThis.getUri().href, restOperation.getBasicAuthorization());

    // A internal service to retrieve service member information from registry, and then update BIG-IP setting.

    //inputEndPoint = inputEndPoint.toString().split(","); 
    logger.fine(
      "MSDA: onPost, " + instanceName + " registry endpoints: " + inputEndPoint
    );

    const etcdctlcmd = '/var/tmp/etcdctl --endpoints=' + inputEndPoint + ' --cacert=/var/tmp/etcdv3ca.Crt --cert=/var/tmp/f5Client.Crt --key=/var/tmp/f5Client.key get --print-value-only ' + inputServiceName ;

    //use etcdctl to retrieve service end endpoints.

    (function schedule() {
        var pollRegistry = setTimeout(function () {

            // If signal is "update", change it into "polling" for new polling loop
            if (global.msdaetcdv3OnPolling.some(instance => instance.name === instanceName)) {
                let signalIndex = global.msdaetcdv3OnPolling.findIndex(instance => instance.name === instanceName);
                if (global.msdaetcdv3OnPolling[signalIndex].state === "update") {
                    if (existingPollingLoop) {
                        logger.fine(
                            "MSDA: onPost/polling, " +
                            instanceName +
                            " update config, existing polling loop."
                        );
                    } else {
                        //logger.fine("MSDA: onPost/polling, " + instanceName + " update config, a new polling loop.");
                        global.msdaetcdv3OnPolling[signalIndex].state = "polling";
                        logger.fine(
                            "MSDA: onPost/polling, " +
                            instanceName +
                            " update the signal.state into polling for new polling loop: ",
                            global.msdaetcdv3OnPolling[signalIndex]
                        );
                    }
                }
                // update the existingPollingLoop to true
                existingPollingLoop = true;
            } else {
                // Non-exist instance, will NOT proceed to poll the registry
                return logger.fine(
                    "MSDA: onPost/polling, " +
                    instanceName +
                    " Stop polling registry."
                );
            }

            // Start to poll the etcdv3 registry ...

            mytmsh.executeCommand(etcdctlcmd)
                .then(function (data) { 
                    data = data.substring(0, data.lastIndexOf('\n'));
                    let nodeAddress = [];
                    if (data.length == 0) {
                        logger.fine(
                          "MSDA: onPost, " +
                            instanceName +
                            " data from etcdv3: ",
                          data
                        );
                    } else {
                        nodeAddress = data.split(',');
                    }
                    logger.fine(
                      "MSDA: onPost, " +
                        instanceName +
                        " service endpoint list: ",
                      nodeAddress
                    );
                    if (nodeAddress.length == 0) {
                        //To clear the pool
                        logger.fine(
                          "MSDA: onPost, " +
                            instanceName +
                            " endpoint list is empty, will clear the BIG-IP pool as well"
                        );
                        mytmsh.executeCommand("tmsh -a list ltm pool " + inputPoolName)
                            .then(function () {
                                logger.fine(
                                  "MSDA: onPost, " +
                                    instanceName +
                                    " found the pool, will delete all members as it's empty."
                                );
                                let commandUpdatePool = 'tmsh -a modify ltm pool ' + inputPoolName + ' members delete { all}';
                                return mytmsh.executeCommand(commandUpdatePool)
                                    .then(function (response) {
                                        logger.fine(
                                          "MSDA: onPost, " +
                                            instanceName +
                                            " update the pool to delete all members as it's empty. "
                                        );
                                    });
                            }, function (error) {
                                logger.fine(
                                  "MSDA: onPost, " +
                                    instanceName +
                                    " GET of pool failed, adding an empty pool: " +
                                    inputPoolName
                                );
                                let inputEmptyPoolConfig = inputPoolName + ' monitor ' + inputMonitor + ' load-balancing-mode ' + inputPoolType + ' members none';
                                let commandCreatePool = 'tmsh -a create ltm pool ' + inputEmptyPoolConfig;
                                return mytmsh.executeCommand(commandCreatePool);
                            })
                                // Error handling - Log the error message.
                            .catch(function (error) {
                                logger.fine(
                                  "MSDA: onPost, " +
                                    instanceName +
                                    " Delete failed: ",
                                    error.message
                                );
                            });
                    } else {
                        logger.fine(
                          "MSDA: onPost, " +
                            instanceName +
                            " member exists, Will moving forward to setup BIG-IP"
                        );

                        //To configure the BIG-IP pool
                        poolMembers = "{" + nodeAddress.join(" ") + "}";
                        logger.fine(
                          "MSDA: onPost, " +
                            instanceName +
                            " pool members: " +
                            poolMembers
                        );
                        let inputPoolConfig = inputPoolName + ' monitor ' + inputMonitor + ' load-balancing-mode ' + inputPoolType + ' members replace-all-with ' + poolMembers;

                        // Use tmsh to update BIG-IP configuration instead of restful API

                        // Start with check the exisitence of the given pool
                        mytmsh.executeCommand("tmsh -a list ltm pool " + inputPoolName).then(function () {
                            logger.fine(
                              "MSDA: onPost, " +
                                instanceName +
                                " Found a pre-existing pool. Update pool setting: " +
                                inputPoolName
                            );
                            let commandUpdatePool = 'tmsh -a modify ltm pool ' + inputPoolConfig;
                            return mytmsh.executeCommand(commandUpdatePool);
                        }, function (error) {
                            logger.fine(
                              "MSDA: onPost, " +
                                instanceName +
                                " GET of pool failed, adding from scratch: " +
                                inputPoolName
                            );
                            let commandCreatePool = 'tmsh -a create ltm pool ' + inputPoolConfig;
                            return mytmsh.executeCommand(commandCreatePool);
                        })
                            // Error handling
                            .catch(function (error) {
                                logger.fine(
                                  "MSDA: onPost, " +
                                    instanceName +
                                    " Add Failure: adding/modifying a pool: ",
                                    error.message
                                );
                            });
                    }
                }, function (err) {
                    logger.fine(
                      "MSDA: onPost, " +
                        instanceName +
                        " Fail to retrieve to endpoint list due to: ",
                      err.message
                    );
                }).catch(function (error) {
                    logger.fine(
                      "MSDA: onPost, " +
                        instanceName +
                        " Fail to retrieve to endpoint list due to: ",
                      error.message
                    );
                }).done(function () {
                    logger.fine("MSDA: onPost/polling, " + instanceName + " finish a polling action.");
                    schedule();
                });
        }, pollInterval);

        // stop polling while undeployment or update the config


        let stopPolling = true;

        if (
            global.msdaetcdv3OnPolling.some(
                (instance) => instance.name === instanceName
            )
        ) {
            let signalIndex = global.msdaetcdv3OnPolling.findIndex(
                (instance) => instance.name === instanceName
            );
            if (global.msdaetcdv3OnPolling[signalIndex].state === "polling") {
                logger.fine(
                    "MSDA: onPost, " +
                    instanceName + " keep polling registry for: ",
                    inputServiceName
                );
                stopPolling = false;
            } else {
                // state = "update", stop polling for existing loop; trigger a new loop for new one.
                if (existingPollingLoop) {
                    logger.fine(
                        "MSDA: onPost, " +
                        instanceName +
                        " update config, will terminate existing polling loop."
                    );
                } else {
                    logger.fine(
                        "MSDA: onPost, " +
                        instanceName +
                        " update config, will trigger a new polling loop."
                    );
                    stopPolling = false;
                }
            }
        }

        if (stopPolling) {
            process.nextTick(() => {
                clearTimeout(pollRegistry);
                logger.fine("MSDA: onPost/stopping, " +
                    instanceName +
                    " Stop polling registry for: " + inputPoolName);
            });
            // Delete pool configuration in case it still there.
            setTimeout (function () {
                const commandDeletePool = 'tmsh -a delete ltm pool ' + inputPoolName;
                mytmsh.executeCommand(commandDeletePool)
                .then (function () {
                    logger.fine("MSDA: onPost/stopping, " +
                        instanceName +
                        " the pool removed: " + inputPoolName);
                })
                    // Error handling
                .catch(function (err) {
                    logger.fine("MSDA: onPost/stopping, " +
                        instanceName +
                        " Delete failed: " + inputPoolName + err.message);
                }).done(function () {
                    return logger.fine(
                        "MSDA: onPost/stopping, " +
                        instanceName +
                        " exit loop."
                    );
                });
            }, 2000);
        }
    })();
};


/**
 * Handles DELETE. The configuration must be removed, if it exists. Patch the block to 'UNBOUND' or 'ERROR'
 *
 * @param restOperation - originating rest operation that triggered this processor
 */
msdaetcdv3ConfigProcessor.prototype.onDelete = function (restOperation) {
    var configTaskState,
        blockState;
    var oThis = this;

    logger.fine("MSDA: onDelete, msdaetcdv3ConfigProcessor.prototype.onDelete");

    var instanceName;
    var inputProperties;
    try {
        configTaskState = configTaskUtil.getAndValidateConfigTaskState(restOperation);
        blockState = configTaskState.block;
        inputProperties = blockUtil.getMapFromPropertiesAndValidate(blockState.inputProperties,
            ["poolName", "poolType"]);
        instanceName = blockState.name;
    } catch (ex) {
        restOperation.fail(ex);
        return;
    }
    this.completeRequest(restOperation, this.wellKnownPorts.STATUS_ACCEPTED);

    // Generic URI components, minus the 'path'
    var uri = this.restHelper.buildUri({
        protocol: this.wellKnownPorts.DEFAULT_HTTP_SCHEME,
        port: this.wellKnownPorts.DEFAULT_JAVA_SERVER_PORT,
        hostname: "localhost"
    });

    // In case user requested configuration to deployed to remote
    // device, setup remote hostname, HTTPS port and device group name
    // to be used for identified requests

    // Delete the polling signal first, then remove the pool in bigip
    let signalIndex = global.msdaetcdv3OnPolling.findIndex(
      (instance) => instance.name === instanceName
    );
    global.msdaetcdv3OnPolling.splice(signalIndex, 1);
    logger.fine(
      "MSDA: onDelete, " +
        instanceName +
        " deleted polling signal!!! Continue to remove the pool in bigip."
    );

    // Use tmsh to update configuration

    mytmsh.executeCommand("tmsh -a list ltm pool " + inputProperties.poolName.value)
        .then(function () {
            logger.fine(
              "MSDA: onDelete, " +
                instanceName +
                " delete Found a pre-existing pool. Full Config Delete"
            );
            const commandDeletePool = 'tmsh -a delete ltm pool ' + inputProperties.poolName.value;
            return mytmsh.executeCommand(commandDeletePool)
                .then (function (response) {
                    logger.fine(
                      "MSDA: onDelete, " +
                        instanceName +
                        " delete The pool is all removed"
                    );
                    configTaskUtil.sendPatchToUnBoundState(configTaskState,
                        oThis.getUri().href, restOperation.getBasicAuthorization());
                    });
        }, function (error) {
            // the configuration must be clean. Nothing to delete
            logger.fine(
              "MSDA: onDelete, " +
                instanceName +
                " pool does't exist: ",
                error.message
            );
            configTaskUtil.sendPatchToUnBoundState(configTaskState, 
                oThis.getUri().href, restOperation.getBasicAuthorization());
        })
        // Error handling - Set the block as 'ERROR'
        .catch(function (error) {
            logger.fine(
              "MSDA: onDelete, " +
                instanceName +
                " Delete failed, setting block to ERROR: ",
                error.message
            );
            configTaskUtil.sendPatchToErrorState(configTaskState, error,
                oThis.getUri().href, restOperation.getBasicAuthorization());
        })
        // Always called, no matter the disposition. Also handles re-throwing internal exceptions.
        .done(function () {
            logger.fine(
              "MSDA: onDelete, " +
                instanceName +
                " Bigip configuration delete DONE!!!"
            );  // happens regardless of errors or no errors ....
            // Delete the polling signal
            //let signalIndex = global.msdaetcdv3OnPolling.indexOf(inputProperties.poolName.value);
            //global.msdaetcdv3OnPolling.splice(signalIndex,1);
        });
    // Stop polling registry while undeploy ??
    //stopPollingEvent.emit('stopPollingRegistry');
    //logger.fine("MSDA: onDelete, Stop polling Registry while ondelete action.");
};

module.exports = msdaetcdv3ConfigProcessor;
