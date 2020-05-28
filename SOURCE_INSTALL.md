// OSX Catalina
export PATH="/usr/local/opt/llvm/bin:$PATH"
export PATH="/usr/local/opt/openssl@1.1/bin:$PATH"
export LDFLAGS="-L/usr/local/opt/llvm/lib -Wl,-rpath,/usr/local/opt/llvm/lib -L/usr/local/opt/openssl@1.1/lib"
export CPPFLAGS="-I/usr/local/opt/llvm/include -I/usr/local/opt/openssl@1.1/include"
export PKG_CONFIG_PATH="/usr/local/Cellar/openssl@1.1/1.1.1g/lib/pkgconfig:\$PKG_CONFIG_PATH"
export CXX=clang++
export GYPFLAGS=-Dmac_deployment_target=10.15
