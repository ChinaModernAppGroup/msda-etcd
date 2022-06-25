# iAppLX MSDA for etcdv2

This iApp is an example of MSDA for etcdv2, including an audit processor.  

## Build (requires rpmbuild)

    $ npm run build

Build output is an RPM package
## Using IAppLX from BIG-IP UI
If you are using BIG-IP, install f5-iapplx-msda-etcd RPM package using iApps->Package Management LX->Import screen. To create an application, use iApps-> Templates LX -> Application Services -> Applications LX -> Create screen. Default IApp LX UI will be rendered based on the input properties specified in basic pool IAppLX.

Pool name is mandatory when creating or updating iAppLX configuration. Optionally you can add any number of pool members.

## Using IAppLX from REST API to configure BIG-IP

Using the REST API to work with BIG-IP with f5-iapplx-msda-etcd IAppLX package installed. 

Create an Application LX block with all inputProperties as shown below.
Save the JSON to block.json and use it in the curl call. Refer to the clouddoc link for more detail: https://clouddocs.f5.com/products/iapp/iapp-lx/tmos-14_0/iapplx_ops_tutorials/creating_iappslx_with_rest.html .

```json
{
  "name": "msdaetcd",
  "inputProperties": [
    {
      "id": "etcdEndpoint",
      "type": "STRING",
      "value": "1.1.1.1:2379, 1.1.1.2:2379",
      "metaData": {
        "description": "Etcd endpoint list",
        "displayName": "etcd endpoints",
        "isRequired": true
      }
    },
    {
      "id": "poolName",
      "type": "STRING",
      "value": "/Common/samplePool",
      "metaData": {
        "description": "Pool Name to be created",
        "displayName": "BIG-IP Pool Name",
        "isRequired": true
      }
    },
    {
      "id": "poolType",
      "type": "STRING",
      "value": "round-robin",
      "metaData": {
        "description": "load-balancing-mode",
        "displayName": "Load Balancing Mode",
        "isRequired": false,
        "uiType": "dropdown",
        "uiHints": {
          "list": {
            "dataList": [
              "round-robin",
              "least-connections-member",
              "least-connections-node"
            ]
          }
        }
      }
    },
    {
      "id": "healthMonitor",
      "type": "STRING",
      "value": "tcp",
      "metaData": {
        "description": "Health Monitor",
        "displayName": "Health Monitor",
        "isRequired": false,
        "uiType": "dropdown",
        "uiHints": {
          "list": {
            "dataList": [
              "tcp",
              "udp",
              "http"
            ]
          }
        }
      }
    },
    {
      "id": "serviceName",
      "type": "STRING",
      "value": "http",
      "metaData": {
        "description": "Service name to be exposed",
        "displayName": "Service Name in etcd",
        "isRequired": false
      }
    }
  ],
  "dataProperties": [
    {
      "id": "pollInterval",
      "type": "NUMBER",
      "value": 30,
      "metaData": {
        "description": "Interval of polling from BIG-IP to etcd",
        "displayName": "Polling Invertal",
        "isRequired": false
      }
    }
  ],
  "configurationProcessorReference": {
    "link": "https://localhost/mgmt/shared/iapp/processors/msdaetcdConfig"
  },
  "audit": {
    "intervalSeconds": 0,
    "policy": "NOTIFY_ONLY"
  },
  "sourcePackage": {
    "packageName": "f5-iapplx-msda-etcd-0.0.3-0001.noarch"
  },
  "configProcessorTimeoutSeconds": 30,
  "statsProcessorTimeoutSeconds": 15,
  "configProcessorAffinity": {
    "processorPolicy": "LOAD_BALANCED",
    "affinityProcessorReference": {
      "link": "https://localhost/mgmt/shared/iapp/processors/affinity/load-balanced"
    }
  },
  "state": "TEMPLATE"
}
```

Post the block through REST API using curl. 
```bash
curl -sk -X POST -d @block.json https://bigip_mgmt_ip:8443/mgmt/shared/iapp/blocks
```
