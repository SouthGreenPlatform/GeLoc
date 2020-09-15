#!/usr/local/bin/perl
use strict;

##############################################################
# convert annot tab to Json for ideogram                     #
##############################################################

#perl annotToJson.pl ../data/annotations/annot_Nip.txt ../data/annotations/nip.json

my $inFile = shift;
my $json = shift;
my $currentChr = "0";
my $first = 1;
my $line;
my $length;

my %track = ( 
'RLK'     => 0,
'NLR'     => 1,
'RLP'     => 2,
);


open JSON, ">$json" or die "cannot create $json !\n";

#initialise le json
print JSON "{\"keys\": [\"name\", \"start\", \"length\", \"trackIndex\"],\n\t\"annots\": [\n";

#initialise chr1:
#print JSON "\t\t{\"chr\": \"1\", \"annots\": [";

#Create a hash containing the list of contigs
open INFILE, "$inFile" or die "cannot open $inFile !\n";
while (<INFILE>) {
	$line =$_;

    #regexp Chr1 Nip 56809 57972 RLK
	#       chr  acc start stop  track
    if ($line=~/(Chr(\d+))\s+.*\s+(\d+)\s+(\d+)\s+(.*)\n/) {
        $length = $4 - $3;

        #chromosome courant
        if ($currentChr == $2){
            #ajoute l'annot
            print JSON ",\n\t\t\t[\"$5\", $3, $length, $track{$5}]";

        #sinon passe au chromosome suivant    
        }else{
            $currentChr = $2;

            #initialise chromosome suivant
            if ($first == 1){
                print JSON "\t\t{\"chr\": \"$2\", \"annots\": [\n";
                $first = 0;
            }else{
                print JSON "]},\n\t\t{\"chr\": \"$2\", \"annots\": [\n";
            }

            #ajoute l'annot:
            print JSON "\t\t\t[\"$5\", $3, $length, $track{$5}]";
        }
    }
}

#termine le JSON
print JSON "]}]}";

close INFILE;
close JSON;