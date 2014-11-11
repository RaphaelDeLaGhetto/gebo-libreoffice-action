gebo-libreoffice-action
=======================

A LibreOffice-dependent gebo action document converter

# Get LibreOffce

How you do this depends on your OS. On Ubuntu 14.04, simply

```
sudo apt-get install libreoffice
```

# Install

```
npm install gebo-libreoffice-action
```

# Enable

```
var gebo = require('gebo-server')();
gebo.enable('libreoffice', require('gebo-libreoffice-action'));
```

# Test

```
sudo nodeunit test
```

## License

MIT
