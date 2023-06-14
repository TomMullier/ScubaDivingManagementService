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
        result = subprocess.run(command, shell=True, capture_output=True, text=True)

        

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
                "baseUrl": f"http://{ip}:3000/",
                "redirectUris": [
                    f"http://{ip}:3000/*"
                ],
                "webOrigins": [
                    f"http://{ip}:3000/*"
                ],
                "attributes": {
                    "backchannel.logout.url": f"http://{ip}:3000/"
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
                "email": "club@club.fr",
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
                if(response2.status_code == 200):
                        print("---------- Club added")
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

newURL="http://" + ip + ":3000/"
writeEnv();
# changeRealm();
# changeKeycloak();
launchDocker();