#!/bin/bash

#_Change_Working_Directory
cd /var/www/biogance-web

#_Remove_Unused_Code
sudo rm -rf node_modules
sudo rm -rf .next

#Install_node_modules_&_Make_React_Build
sudo npm install
sudo npm run build
sudo pm2 restart "biogance web" --update-env