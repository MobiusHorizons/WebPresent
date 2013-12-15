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

#if (m!<link.*href="([^"]+)"!){
#	my $content = `curl -f -s $1`;
#	s/(<link.*)href="[^"]+"(.*)\/>/$1>$content<\/link>/;
#}
if (m!<script.*src="([^"]+)"!){
	my $content = `curl -f -s $1`;
	s!(<script.*)src="[^"]+"(.*)>!<script > $content</script>!;
}
print $_;
}
# End Main
####################################
