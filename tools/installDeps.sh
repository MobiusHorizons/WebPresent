#!/bin/bash

##################      Declarations     ###################

	declare -A nodeModules;
	nodeModules[concat]=grunt-contrib-concat
	nodeModules[uglify]=grunt-contrib-uglify
	nodeModules[cssmin]=grunt-contrib-cssmin
	nodeModules[img-embed]=grunt-image-embed
	nodeModules[embed]=grunt-embed
	
	NPM=""
	GRUNT=""
	MODULES=""
	PKG_MGR=""
	SUDO=$(which sudo)


################## Finds Package Manager ###################

GetPackageManager(){
	declare -A osInfo;
	osInfo[/etc/redhat-release]="yum install"
	osInfo[/etc/arch-release]="pacman -Syw"
	osInfo[/etc/gentoo-release]="emerge"
	osInfo[/etc/SuSE-release]="zypper install"
	osInfo[/etc/debian_version]="apt-get install"

	PKGM=""
	for f in ${!osInfo[@]}
	do
	    if [[ -f $f ]];then
		PKGM=${osInfo[$f]}
	    fi
	done

	PKG_MGR=$(which $PKGM)
	if [ $? -ne 0 ] 
	then
		echo "Package manager cannot be identified"
		exit 1
	else 
		return 0
#		echo "$PKG_MGR"
	fi
}

##################      Checks Modules    ###################
checkModules(){

	for m in ${!nodeModules[@]}
	do
		module=${nodeModules[$m]}
		echo npm list $module \| grep  $module -q
		npm list $module |grep $module -q
		if [ $? -ne 0 ] ; then
			echo "installing grunt module $m "
			$SUDO $NPM install $module
			if [ $? -ne 0 ];then exit 3;fi
		fi
	done
}

##################      Check for npm    ###################
checkNode(){
	NPM=$(which npm 2> /dev/null )
	if [ $? -ne 0 ]; then 
		GetPackageManager
		echo "installing npm (Node Package Manager)"
		$SUDO $PKG_MGR npm
		if [ $? -ne 0 ];then exit 1;fi
		NPM=$(which npm 2> /dev/null )
	fi
}

##################    Check for grunt    ###################
checkGrunt(){
	GRUNT=$(which grunt 2> /dev/null )
	if [ $? -ne 0 ]; then 
		echo "installing grunt"
		$SUDO $NPM install -g grunt-cli
		if [ $? -ne 0 ];then exit 2;fi
		GRUNT=$(which grunt 2> /dev/null )	
	fi
	NODE=$(which node 2> /dev/null ) # on ubuntu node is called nodejs
	if [ $? -ne 0 ]; then
		NODEJS=$(which nodejs 2> /dev/null )
		if [ $? -eq 0 ]; then
			echo "fixing symlink for nodejs"
			sudo ln -s -T $NODEJS /usr/bin/node
		else
			echo "You will need to have NodeJS, please install and run again"
			exit 4
		fi
	fi
}

##################   main Program        ###################

checkNode
checkGrunt
checkModules
echo "npm grunt and dependencies installed"
