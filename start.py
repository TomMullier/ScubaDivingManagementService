import socket

from dotenv import dotenv_values, set_key
import json
import subprocess
import webbrowser
import requests


def get_ip_address():
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
                sock.connect(("8.8.8.8", 80))
                ip_address = sock.getsockname()[0]
                return ip_address
        except socket.error as e:
                print("Failed to get IP address:", e)
        finally:
                sock.close()

def writeEnv():        
        print("----- Writing in .env file")
        env = dotenv_values('.env')
        ip_address = get_ip_address()
        env['IP_PERSO'] = ip_address
        set_key('.env', 'IP_PERSO', ip_address)
        print ("----- IP address updated in .env file (IP_PERSO = " + ip_address + ")")

def changeRealm():
        # Read the JSON file
        with open('./keycloak_import/SDMS-realm.json', 'r') as json_file:
                data = json.load(json_file)

        # Check if "clients" attribute exists
        if "clients" in data:
                clients = data["clients"][0]["baseUrl"]
                data["clients"][0]["baseUrl"] = newURL
                print("----- Modifying :", clients)
                print("---------- Replaced by : ", data["clients"][0]["baseUrl"])
                uris =  data["clients"][0]["redirectUris"]
                data["clients"][0]["redirectUris"] = [newURL+"*"]
                print("----- Modifying :", uris)
                print("---------- Replaced by : ", data["clients"][0]["redirectUris"])
                webOrigin = data["clients"][0]["webOrigins"]
                data["clients"][0]["webOrigins"] = [newURL+"*"]
                print("----- Modifying :", webOrigin)
                print("---------- Replaced by : ", data["clients"][0]["webOrigins"])
                att = data["clients"][0]["attributes"]["backchannel.logout.url"]
                data["clients"][0]["attributes"]["backchannel.logout.url"] = newURL
                print("----- Modifying :", att)
                print("---------- Replaced by : ", data["clients"][0]["attributes"]["backchannel.logout.url"])
                
                
                
                with open('./keycloak_import/SDMS-realm.json', 'w') as json_file:
                        json.dump(data, json_file, indent=4)
        else:
                print("Clients attribute not found in the JSON file.")
        

def changeKeycloak():
        # Read the JSON file
        with open('keycloak.json', 'r') as json_file:
                data = json.load(json_file)

        # Check if "clients" attribute exists
        if "auth-server-url" in data:
                url = data["auth-server-url"]
                data["auth-server-url"] = "http://" + ip + ":8080"
                print("----- Modifying :", url)
                print("---------- Replaced by : ", data["auth-server-url"])
                
                with open('keycloak.json', 'w') as json_file:
                        json.dump(data, json_file, indent=4)
        else:
                print("Clients attribute not found in the JSON file.")
                
def launchDocker():
        print ("----- Launching docker compose")
        command = "docker compose up -d" 
        result = subprocess.Popen(command, shell=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        result.wait();  
        for line in result.stdout:
                print(line)

        

        url = f"http://{ip}:8080/realms/SDMS/protocol/openid-connect/token"

        payload = 'client_id=SDMS_connect&client_secret=uanSPPp2dE7Q3VFx4nkqeFJEA8DvzXua&grant_type=client_credentials'
        headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
        }

        response = requests.request("POST", url, headers=headers, data=payload)
        print(response)
        if(response.status_code == 200):
                print("----- Getting token")
                print("---------- Token retrieved")
                token = response.json()["access_token"]


                url3 = f"http://{ip}:8080/admin/realms/SDMS/clients/c346816f-76c8-4e05-8a24-bb1ee736e479"
                print(url3)
                payload3 = json.dumps({
                        "id": "c346816f-76c8-4e05-8a24-bb1ee736e479",
                        "clientId": "SDMS_connect",
                        "name": "${client_SDMS_connect}",
                        "description": "",
                        "rootUrl": "",
                        "adminUrl": "",
                        "baseUrl": f"http://{ip}:3000/",
                        "surrogateAuthRequired": False,
                        "enabled": True,
                        "alwaysDisplayInConsole": False,
                        "clientAuthenticatorType": "client-secret",
                        "secret": "uanSPPp2dE7Q3VFx4nkqeFJEA8DvzXua",
                        "redirectUris": [
                          f"http://{ip}:3000/*"
                        ],
                        "webOrigins": [
                          f"http://{ip}:3000/*"
                        ],
                        "notBefore": 0,
                        "bearerOnly": False,
                        "consentRequired": False,
                        "standardFlowEnabled": True,
                        "implicitFlowEnabled": False,
                        "directAccessGrantsEnabled": True,
                        "serviceAccountsEnabled": True,
                        "authorizationServicesEnabled": True,
                        "publicClient": False,
                        "frontchannelLogout": False,
                        "protocol": "openid-connect",
                        "attributes": {
                          "client.secret.creation.time": "1684857298",
                          "post.logout.redirect.uris": "+",
                          "oauth2.device.authorization.grant.enabled": "false",
                          "backchannel.logout.revoke.offline.tokens": "false",
                          "use.refresh.tokens": "true",
                          "oidc.ciba.grant.enabled": "false",
                          "backchannel.logout.session.required": "true",
                          "backchannel.logout.url": f"http://{ip}:3000/",
                          "client_credentials.use_refresh_token": "false",
                          "tls.client.certificate.bound.access.tokens": "false",
                          "require.pushed.authorization.requests": "false",
                          "acr.loa.map": "{}",
                          "display.on.consent.screen": "false",
                          "token.response.type.bearer.lower-case": "false"
                        },
                        "authenticationFlowBindingOverrides": {},
                        "fullScopeAllowed": True,
                        "nodeReRegistrationTimeout": -1,
                        "protocolMappers": [
                          {
                            "id": "365eec5a-2ce7-4d8a-9bd9-ded77ff3afc0",
                            "name": "Client IP Address",
                            "protocol": "openid-connect",
                            "protocolMapper": "oidc-usersessionmodel-note-mapper",
                            "consentRequired": False,
                            "config": {
                              "user.session.note": "clientAddress",
                              "userinfo.token.claim": "true",
                              "id.token.claim": "true",
                              "access.token.claim": "true",
                              "claim.name": "clientAddress",
                              "jsonType.label": "String"
                            }
                          },
                          {
                            "id": "26413990-798f-494f-878e-069f240171b4",
                            "name": "Client ID",
                            "protocol": "openid-connect",
                            "protocolMapper": "oidc-usersessionmodel-note-mapper",
                            "consentRequired": False,
                            "config": {
                              "user.session.note": "client_id",
                              "userinfo.token.claim": "true",
                              "id.token.claim": "true",
                              "access.token.claim": "true",
                              "claim.name": "client_id",
                              "jsonType.label": "String"
                            }
                          },
                          {
                            "id": "551a96cf-6af4-4317-bd77-6737145f2f8f",
                            "name": "Client Host",
                            "protocol": "openid-connect",
                            "protocolMapper": "oidc-usersessionmodel-note-mapper",
                            "consentRequired": False,
                            "config": {
                              "user.session.note": "clientHost",
                              "userinfo.token.claim": "true",
                              "id.token.claim": "true",
                              "access.token.claim": "true",
                              "claim.name": "clientHost",
                              "jsonType.label": "String"
                            }
                          }
                        ],
                        "defaultClientScopes": [
                          "web-origins",
                          "acr",
                          "roles",
                          "profile",
                          "good-service",
                          "email"
                        ],
                        "optionalClientScopes": [
                          "address",
                          "phone",
                          "offline_access",
                          "microprofile-jwt"
                        ],
                        "access": {
                          "view": True,
                          "configure": True,
                          "manage": True
                        }
                })
                headers3 = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {token}'
                }

                response3 = requests.request("PUT", url3, headers=headers3, data=payload3)
                print("----- Change IP Keycloak Admin Panel for : ", ip)
                print(response3)
                if(response3.status_code == 204):
                        print("---------- IP changed in Keycloak Admin Panel")
                else:
                        print("---------- Error while changing IP")

                url2 = f"http://{ip}:8080/admin/realms/SDMS/users"

                payload2 = json.dumps({
                "email": f"{clubMail}",
                "emailVerified": True,
                "credentials": [
                    {
                    "type": "password",
                    "value": "pass"
                    }
                ],
                "enabled": True
                })
                headers2 = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {token}'
                }

                response2 = requests.request("POST", url2, headers=headers2, data=payload2)
                print("----- Adding club")
                if(response2.status_code == 201):
                        print("---------- Club added")
                        


                        url4 = f"http://{ip}:8080/admin/realms/SDMS/users?username={clubMail}"
                        payload4 = ""
                        headers4 = {
                                'Authorization': f'Bearer {token}'
                        }

                        response = requests.request("GET", url4, headers=headers4, data=payload4)

                        print(response)
                        clubId = response.json()[0]["id"]

                        # AJOUTER ROLE CLUB
                        url5 = f"http://{ip}:8080/admin/realms/SDMS/users/{clubId}/role-mappings/realm"
                        payload5 = json.dumps([
                                {
                                        "id": "dad8c5a9-e2a3-4c4a-9b75-449603c98cce",
                                        "name": "club",
                                        "composite": True,
                                        "containerId": "SDMS"
                                }
                        ])
                        headers5 = {
                                'Content-Type': 'application/json',
                                'Authorization': f'Bearer {token}'
                        }
                        response5 = requests.request("POST", url5, headers=headers5, data=payload5)
                        print(response5)


                else:
                        print("---------- Error while adding club")
        else:
                print("---------- Error while retrieving token")
        
        
        
        
        # Check the output
        if result.returncode == 0:
                output = result.stdout
                print ("----- Opening web browser")
                webbrowser.open(newURL)
        else:
                print("--------- An error occurred:", result.stderr)
                


ip = get_ip_address()
print("IP address:", ip)

clubMail = "club@club.fr"
clubId = ""

newURL="http://" + ip + ":3000/"
writeEnv();
changeRealm();
changeKeycloak();
launchDocker();