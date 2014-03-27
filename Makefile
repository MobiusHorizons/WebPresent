all: install_deps build


install_deps: tools/installDeps.sh
	echo "checking Dependencies"
	@tools/installDeps.sh

build:
	@ grunt

test: 
	@grunt test


clean: 
	@rm -rf css/* js/app.min.js js/app.js js/*~ src/*~ StudentNews.html *~
	
