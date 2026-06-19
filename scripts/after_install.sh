#!/bin/bash

#_Change_Working_Directory
cd /var/www/biogance-web

#_Remove_Unused_Code
sudo rm -r pnpm-lock.yaml
sudo rm -rf node_modules
sudo rm -rf .next

#Install_node_modules_&_Make_React_Build
pnpm install --force
npm run build
pm2 reload "biogance web" --update-env