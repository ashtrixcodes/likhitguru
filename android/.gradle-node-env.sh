#!/bin/bash
# This file is sourced by Gradle to resolve the Node.js binary path.
# It sets NODE_BINARY for NVM-based Node installations.

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

export NODE_BINARY=$(which node)
