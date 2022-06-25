# MSDA for etcdv3

This iApp is an example of MSDA for etcdv3, including an audit processor.

## Build (requires rpmbuild)

    $ npm run build

Build output is an RPM package
## Using IAppLX from BIG-IP UI
If you are using BIG-IP, install f5-iapplx-msda-etcdv3 RPM package using iApps->Package Management LX->Import screen. To create an application, use iApps-> Templates LX -> Application Services -> Applications LX -> Create screen. Default IApp LX UI will be rendered based on the input properties specified in basic pool IAppLX.

Pool name is mandatory when creating or updating iAppLX configuration. Optionally you can add any number of pool members.

## Using IAppLX from REST API to configure BIG-IP

Using the REST API to work with BIG-IP with f5-iapplx-msda-etcd IAppLX package installed.

Create an Application LX block with all inputProperties as shown below. Save the JSON to block.json and use it in the curl call. Refer to the clouddoc link for more detail: https://clouddocs.f5.com/products/iapp/iapp-lx/tmos-14_0/iapplx_ops_tutorials/creating_iappslx_with_rest.html .

```json
{
  "name": "msdaetcdv3",
  "inputProperties": [
    {
      "id": "etcdv3Endpoint",
      "type": "STRING",
      "value": "1.1.1.1:2379",
      "metaData": {
        "description": "etcdv3 endpoint list",
        "displayName": "etcdv3 endpoints",
        "isRequired": true
      }
    },
    {
      "id": "authenticationCert",
      "type": "JSON",
      "value": {
        "etcdv3Cert": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURRekNDQWl1Z0F3SUJBZ0lJRXFXZkNPWG5iell3RFFZSktvWklodmNOQVFFTEJRQXdFakVRTUE0R0ExVUUKQXhNSFpYUmpaQzFqWVRBZUZ3MHlNakExTVRJeE1EQTBNRGxhRncweU16QTFNVEl4TURBME1EbGFNQkV4RHpBTgpCZ05WQkFNVEJuVmlkVzUwZFRDQ0FTSXdEUVlKS29aSWh2Y05BUUVCQlFBRGdnRVBBRENDQVFvQ2dnRUJBTGJKCnNpOGVaTGQxQkRNWWFhM3phOWVQdXZCYk9obUc2a0s5OXBJcklTUEMvVENEOWZnalFtTDM4UWkzalFRd3dXNCsKUU5rZ0V6T2ovQmxHaGsyWkcwZmxkTUlMcklNTURoOWVtTkx6bkhoVTRsb2F3NktXQTRvV1NteUlqcWp6MVY0NwprRms1bVMwcThlR2ZNRk5BU3p6eDFaMVk2amFQejExcmlPV1BXZlNNSTJVRkpsbktYVFRHQzErWDZ6bVBkMnRjCmRXZUJDRG5QUVRsWWNQQkU0M2VSUytEY3QwUk5BQWp1bFZJRWlmTmNNbnd6SzhDYWlwdkVlTnVWcmh4b1NzaDgKV1BVZ3RqUittUUdZYjZSWnkvWWpVNG5HQkE4a3V6YmVBSGQwN2c2UUxiL2c2T1hNZ3FWZWxEN3FhL25qMnUyQQpVeFplZ3ZkdnFEQ25jTlI5VWlNQ0F3RUFBYU9CblRDQm1qQU9CZ05WSFE4QkFmOEVCQU1DQmFBd0hRWURWUjBsCkJCWXdGQVlJS3dZQkJRVUhBd0VHQ0NzR0FRVUZCd01DTUF3R0ExVWRFd0VCL3dRQ01BQXdId1lEVlIwakJCZ3cKRm9BVXdHVmhLaFB2OW5rYWRWai9LRXNkV1lhdi80d3dPZ1lEVlIwUkJETXdNWUlKYkc5allXeG9iM04wZ2daMQpZblZ1ZEhXSEJBb0JBYUNIQkg4QUFBR0hFQUFBQUFBQUFBQUFBQUFBQUFBQUFBRXdEUVlKS29aSWh2Y05BUUVMCkJRQURnZ0VCQUtZdXBpMHFzRm5pRFoydVAyL2tnS051QWtmcEdUamtVOVllNW9aY0hNRWx4NUx6eGduSGZqUXAKS0h3cDk1SzlVK0h5NUEvcFRBSmlCOVVlT3dRY2ZJUldHUk9XSzVRZURiR2huRytGQkdGdUx6QXQrMU5TbXIrLwpEd0w1dW5pekFhZWVLMFl4K0ZmVW9JNkxKa3FOT0hsSm1oRDFjU1duWU40TTYyOHdJZ0QyQ1dvQnVBQmd2cUt0ClljaitKbitCZW1pTE9NSkcxMEtQUGY3SW5lSDRSZ0ExUG0rWkdEQXFJcDBwWVEwRzZmQk9OTVAvZlZjTEdIK3QKcGtlWGNxNGhscmZwR0lqcjdGSFpINzNpYWNySnU5SVRIZG5lenFESGZTNVdNM0FEVm03TGppenFIREpINHFRNwp2WXFLNEFFb3I1TWN4YzFQaGNFR0lFNWgxWk9pdXFnPQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==",
        "etcdv3Key": "LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFb3dJQkFBS0NBUUVBdHNteUx4NWt0M1VFTXhocHJmTnIxNCs2OEZzNkdZYnFRcjMya2lzaEk4TDlNSVAxCitDTkNZdmZ4Q0xlTkJEREJiajVBMlNBVE02UDhHVWFHVFprYlIrVjB3Z3VzZ3d3T0gxNlkwdk9jZUZUaVdockQKb3BZRGloWktiSWlPcVBQVlhqdVFXVG1aTFNyeDRaOHdVMEJMUFBIVm5WanFOby9QWFd1STVZOVo5SXdqWlFVbQpXY3BkTk1ZTFg1ZnJPWTkzYTF4MVo0RUlPYzlCT1ZodzhFVGpkNUZMNE55M1JFMEFDTzZWVWdTSjgxd3lmRE1yCndKcUttOFI0MjVXdUhHaEt5SHhZOVNDMk5INlpBWmh2cEZuTDlpTlRpY1lFRHlTN050NEFkM1R1RHBBdHYrRG8KNWN5Q3BWNlVQdXByK2VQYTdZQlRGbDZDOTIrb01LZHcxSDFTSXdJREFRQUJBb0lCQUNRZ2Z6Z3k0S01sM0p1ZwpzcHB2NXh1bXk4TGZ0UDhBbkdKdW0wSk9oZkZFZzdoSURLQnJqNTV4OU5ETlBuRGFsaENNKzFJdXRiemFKMlJ6CmZPM3ZXZVgrNHZITFR1Qmp6SkxFcHAzakNrVDZPZmFuSFkyUDZza3JHTENVMk9WcHMvMDQ5cEc4QVp0Y3hvdmEKWTduQWxsNUlTZmtjYnNZejdEOUJsc0FRY2k0VUFzYy9vNFZvS1pFeTNBeEdqamdIVGpTejQ3WFVpU2xuZWt3TQpubENqYWovYTNmQjRBb1pXd0JVQ1ZNblB0dVorN0RNdFhuQU5zV0M3TkdTVU0wcmVxYzJHQ3Z2MTloOUYzODFJCngzVWV6dHJtSmFxdWgyckFQczhuamM1MnZtL2tOeTVMZTZKLzRVc1pyKzlUTS92WkM2TVVWTTR4UGt2ZkJ3dC8KTzgvNEk0RUNnWUVBeHVXOXpJV2Vtc1lkRHNrNjU1QjVraUhieFp5WTdOTVVuQ3FoTGRtR1JkdFRuT3R3ditRRwpvU0ZyQ1FvT3p3K1hONWZyMThCZmdxQ3p1aS96OFNVMTBVckhiY2pXcWRtbXFjaG1Mcm5vUFUxcmRLZDdnQmMvCktvMlFwWVY3VXV4dzY1Sk40M0RTc2lRK2t5N01nTU03b1UwNWVNT2FZNzA3VjdLMnlJL3VUdU1DZ1lFQTYwUDEKbk02cHdRV2JkcUE3dU93VEJuaG1jN2RnRGErNVNYWTRhVHBUSDI3aGZWTkMxb3FrbUpSck9RaUhMV0NGbFh0YwpnTEs3K3k5b2VVT3V0S25YdWRHQ0U0TEJ2R2ZqUE9SUnVQdU53cmo3Mk1mRHBValdCUXJQTkRVNFlLM2w5a0ZkClRnZWg3ZHFkbnpaYlpkT3QvSTI0SHdnVDhDcm1tdDlVazZaekU4RUNnWUVBc2R3TjNzOTZKak9WRm56U1JQTEkKRStwZEtoaEFGRDhwaGdFRkF3Z3E3MXNUS1JiTlMzdHdoalJwRDd0RHhOdlBRTEtFL3ZrVEw2L2ZLRmJyVUxBUwpzU2Fxc2J6UVlUQzF2Y3ZydkVzWXA0RU0zMU5KdUNDUnBzN1RFNEVLNS90eGV1Ym82Y01oVnBYY3N5YzlUc1BICkZoWUZsNzFxMlZnRnNnV3BPQzZsVHpzQ2dZQUdON0dTQjFRdEtiekdFYzRDUVJydm5OYjRUK3hWOEVMeFVoS0QKbFdzRTlhVTM3cTloaENCOWQ4NnRuekFUWHUybzJhM0VLUFVXMmxYa2ZvbHJkT0dpbzRyUWdUQWxqb2xPM3FuYQpQYXV0YmI0YUtJMWZIT0dyR0hJSmF5Nm1QM0pJWThuWGVoUXBlUkdaVjVKcXlvRmFuMVF5WGNCSkpKa2Jsck5oCmc1Q2ZBUUtCZ0VVQ3R4dnJ1NXArdytyNkovYmZRMGcySmMwVlROVUFoaFBuQk9mOXNhNE9aSWJqYWFwTmFJNGsKMmlJVkloY0hMUlJJTDlHNERHL3N4Ti8ydXMxUjk0Vm5ocGxFTWRHeEMydkY0VDgwMzNjS3FZbFEzWVZqSmJMNgpyMDBqM3BzeUFleXFiSytjWVM4WTlFNUJDYjR1UUhteUdrTG9WVDl4VG5pNHVaclZxVUhqCi0tLS0tRU5EIFJTQSBQUklWQVRFIEtFWS0tLS0tCg==",
        "caCert": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUM5VENDQWQyZ0F3SUJBZ0lCQURBTkJna3Foa2lHOXcwQkFRc0ZBREFTTVJBd0RnWURWUVFERXdkbGRHTmsKTFdOaE1CNFhEVEl5TURVeE1qRXdNRFF3T1ZvWERUTXlNRFV3T1RFd01EUXdPVm93RWpFUU1BNEdBMVVFQXhNSApaWFJqWkMxallUQ0NBU0l3RFFZSktvWklodmNOQVFFQkJRQURnZ0VQQURDQ0FRb0NnZ0VCQU1qcElOSWk4UXl5ClNkMC9lUFpBYXpXdVlzSW5NNUpxTUNkVnBvbnVnbHRSNnYvT29xcXZyd3FCM3dWS0JLNktESUpLeVUvd3FuS3MKMXc0Qy9JQytJRWN5YVZIRGxxOEgyckJGYVYxZkJiL0FVNzk1ZWl5Y2FUcW9uS1A5VE1MeVJLMk5KT1FRdlBFNwovd3BSNmVPaldEWG1oQUhZd0I1ZkVBbTJNNDNXSWlPREVZQXRVYmtZeGI2RGNUUlhHblJXRHE1ZWgrblc4aWhwCmFLSGh3ejBRZVJHUXJJQVFHZ3BjcGN6dy9SMzArOG1pWW8wMmlIdng1YTBmNFMzL3dMTk0vR05NWTAwZk1Nd0oKTFVyN0k0eTRsU1hRUmdMTkdtbm9WNVk2aHAxMlp3a1pUQjJsc0hUaXJabFhjdU1JdnVFUHYwT2lzRXp4SXFFaAphcU81NEU2QXBHRUNBd0VBQWFOV01GUXdEZ1lEVlIwUEFRSC9CQVFEQWdLa01BOEdBMVVkRXdFQi93UUZNQU1CCkFmOHdIUVlEVlIwT0JCWUVGTUJsWVNvVDcvWjVHblZZL3loTEhWbUdyLytNTUJJR0ExVWRFUVFMTUFtQ0IyVjAKWTJRdFkyRXdEUVlKS29aSWh2Y05BUUVMQlFBRGdnRUJBRmpNdnN2SUxzQUprZEllNVM5ZW5RZXEvUjVEc0NHZAphMHJEZVFMeFBjTTNUcjNqbDZ3MUExeXh1MktobjAxb0tCdmxVTTVvUDFCaFdad0tncnhIT3BuTmFacU1FYk11CjFYYzBZTDlBOCtWWHloV2QxV1g1blQ4OFo1dHc3dHZScHA0Q013RWRMZ284ZWRGU2VYVCtXNS94NFFKNys4UXkKRU1pUENmaXY4K3hwbzQwNlhVQlBXYlIzOVhLYWp2T0NzSlNYMzEvdmI1dkthWFpLRzZUV0xoRzA5ZE9TamRDYQoxaEw3RG1uSUlCWHBUeUcwY3hacEJTeTNWTktkeUR3TW1CelRtbnhWWDM3Z3Qzb2xsV1A1SThiK2Yycm9wOHVvClgrWXFmUi94cFFFdDJDZ1dqRmgyRG5lMXZsQks2b0xJTk5WenpZUmxKb21kNXlEK1JubUUwTjQ9Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K"
      },
      "metaData": {
        "description": "etcdv3 lient authentication certificate in base64 encoding",
        "displayName": "etcdv3 client certificate",
        "isRequired": true
      }
    },
    {
      "id": "serviceName",
      "type": "STRING",
      "value": "/msdademo/http",
      "metaData": {
        "description": "Service name to be exposed",
        "displayName": "Service Name in registry",
        "isRequired": true
      }
    },
    {
      "id": "poolName",
      "type": "STRING",
      "value": "/Common/etcdv3SamplePool",
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
        "isRequired": true,
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
      "value": "none",
      "metaData": {
        "description": "Health Monitor",
        "displayName": "Health Monitor",
        "isRequired": true,
        "uiType": "dropdown",
        "uiHints": {
          "list": {
            "dataList": [
              "tcp",
              "udp",
              "http",
              "none"
            ]
          }
        }
      }
    }
  ],
  "dataProperties": [
    {
      "id": "pollInterval",
      "type": "NUMBER",
      "value": 30,
      "metaData": {
        "description": "Interval of polling from BIG-IP to registry, 30s by default.",
        "displayName": "Polling Invertal",
        "isRequired": false
      }
    }
  ],
  "configurationProcessorReference": {
    "link": "https://localhost/mgmt/shared/iapp/processors/msdaetcdv3Config"
  },
  "auditProcessorReference": {
    "link": "https://localhost/mgmt/shared/iapp/processors/msdaetcdv3EnforceConfiguredAudit"
  },
  "audit": {
    "intervalSeconds": 60,
    "policy": "ENFORCE_CONFIGURED"
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

Post the block REST container using curl. 
```bash
curl -sk -X POST -d @block.json https://bigip_mgmt_ip:8443/mgmt/shared/iapp/blocks
```
