#!/usr/bin/perl 
#===============================================================================
#
#         FILE: unify.pl
#
#        USAGE: ./unify.pl  
#
#  DESCRIPTION: output the html including all links into one file
#
#      OPTIONS: ---
# REQUIREMENTS: ---
#         BUGS: ---
#        NOTES: ---
#       AUTHOR: Paul Martin
# ORGANIZATION: 
#      VERSION: 1.0
#      CREATED: 02/24/2013 08:46:20 PM
#     REVISION: ---
#===============================================================================

use strict;
use warnings;

####################################
# Vars								

my $file = "./index.html";

# End vars
####################################

####################################
# Main

open (IN, $file);
for (<IN>){

if (m!<link.*href="([^"]+)"!){
	my $url = $1;
	my $content;
	if ($url =~ m!^(http)|(https)|(ftp)|(file)://!){
		$content = `curl -f -s $url`;
	} else {
		$content =` cat $url`;
	}
	s!(<link.*)href="[^"]+"(.*)/>!<style>$content</style>!;
}
if (m!<script.*src="([^"]+)"!){
	my $url = $1;
	my $content;
	if ($url =~ m!^(http)|(https)|(ftp)|(file)://!){
		$content = `curl -f -s $url`;
	} else {
		$content = `cat $url`;
	}
	s!(<script.*)src="[^"]+"(.*)>!<script > $content</script>!;
}
print $_;
}
# End Main
####################################
