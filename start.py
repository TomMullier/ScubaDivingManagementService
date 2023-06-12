import socket
from dotenv import dotenv_values, set_key
import json
import subprocess
import webbrowser


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

        # Check the output
        if result.returncode == 0:
                output = result.stdout
                print ("----- Opening web browser")
                webbrowser.open(newURL)
                # print("Command output:", output)
                # print ("----- Launching docker logs")
                # command = "./logs.sh" 
                # result = subprocess.run(command, shell=True, capture_output=True, text=True)

                # # Check the output
                # if result.returncode == 0:
                #         output = result.stdout
                #         print("Command output:", output)
                # else:
                #         print("An error occurred:", result.stderr)
        else:
                print("An error occurred:", result.stderr)
                


ip = get_ip_address()
print("IP address:", ip)

newURL="http://" + ip + ":3000/"
writeEnv();
changeRealm();
changeKeycloak();
launchDocker();