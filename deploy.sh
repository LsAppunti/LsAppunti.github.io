#!/bin/bash

if [ -z "$1" ]; then
  echo "Error: No commit message provided."
  echo "Usage: ./deploy.sh \"Your commit message here\""
  exit 1
fi

git add .
git commit -m "$1"
git push origin
