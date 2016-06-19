#!/bin/bash
# bash scripts to fix grunt output for RPGX Survey

grunt build

# change directory, put currently directory on the stack
pushd /home/birched/sourcefiles/RPGX/Survey/dist


# fix file location references
sed -i.bak 's/src=scripts/src=survey\/scripts/g' index.html
sed -i.bak 's/href=styles/href=survey\/styles/g' index.html
sed -i.bak 's/questions.json/survey\/questions.json/g' scripts/main.*.js

ls styles/*css

# return to original directory
popd

