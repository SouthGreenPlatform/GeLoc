# coding=utf-8
from Bio import SeqIO
import argparse
import csv
import GFFclass

#----------------------------------#
#      PARAMETRES
#----------------------------------#
# - Path of genomic fasta file
# - Path of gff file

parser = argparse.ArgumentParser()

parser.add_argument("-f","--fasta", type=str, help="Exact path of genomic fasta file")
parser.add_argument("-g","--gff", type=str, help="Exact path of gff file")

args = parser.parse_args()


#----------------------------------#
#      FUNCTIONS
#----------------------------------#

def importGFF(myfile) :

    gff = open(myfile, mode = "r")
    gff_reader = csv.reader(gff,delimiter = "\t")

    genes=[]
    gnCount=0

    for row in gff_reader : 
        if len(row)==9 :            
            if(row[2]=="gene") :
                gnCount+=1
                ident=""
                L=row[8].split(";")                
                for ft in L :
                    if "ID=" in ft :
                        ident=ft.replace("ID=","")
                genes.append(GFFclass.GeneFeatures(ident,row[0],int(row[3]),int(row[4]),row[6],row[1]))                                
                genes[gnCount-1].add_feature(row[8],";")  
                
            elif row[2]=="CDS" :
                rk=genes[gnCount-1].get_nbCDS()
                genes[gnCount-1].add_CDS((rk+1),int(row[3]),int(row[4]))

                
            elif row[2]=="exon" :  
                rk=genes[gnCount-1].get_nbExon()
                genes[gnCount-1].add_Exon((rk+1),int(row[3]),int(row[4]))
    
    gff.close()
    
    return genes


def predict_stop(gffgene,fasta_geno):
    stop=[]
    cor_phase=0  
    cumul=0  
    if gffgene.strand == "+" :
        STOP_CODONS=["TAG","TGA","TAA"]
    else :
        STOP_CODONS=["CTA","TCA","TTA"]
     
    for icds in gffgene.CDS :
        cumul=cumul+(gffgene.CDS[icds].get_stop()-gffgene.CDS[icds].get_start()+1)
        start_pos=gffgene.CDS[icds].get_start()-1+cor_phase ## len cds + décallage de phase (si codons partiels)
        stop_pos=gffgene.CDS[icds].get_stop()
        for pos in range(start_pos,stop_pos,3):
            if fasta_geno[gffgene.chr][pos:pos+3].seq.upper() in STOP_CODONS :
                stop.append(pos+1)
        reste=cumul%3
        if reste == 0 :
            cor_phase=0
        else:
            cor_phase=3-reste  
    return stop   


    
#----------------------------------#
#            MAIN
#----------------------------------#

chr_dict = SeqIO.to_dict(SeqIO.parse(args.fasta, "fasta"))
gff_list = importGFF(args.gff)

frameshift={}
stop={}


# 1. gene file : chr, gene_id, start, stop
genefile = open("info_gene.txt","w")
for gene in gff_list :
    genefile.write((gene.id+"\t"+str(gene.chr)+"\t"+str(gene.get_start())+"\t"+str(gene.get_stop())+"\n"))

genefile.close()

# 2. Frameshift
FSfile = open("frameshift.txt","w")
for gene in gff_list :
    gene.predict_sequence_alteration()
    if len(gene.alter)>0 :
        for iFS in gene.alter :
            FSfile.write((gene.id+"\t"+str(gene.alter[iFS].start)+"\n"))
    
FSfile.close()

# 3. Stop
STOPfile = open("stop.txt","w")
for gene in gff_list :
    stop=predict_stop(gene,chr_dict)
    if len(stop)>0 :
        for istop in range(len(stop)) :
            if(stop[istop]<gene.get_stop()-2) : # skip terminal stop codon
                STOPfile.write((gene.id+"\t"+str(stop[istop])+"\n"))
            
STOPfile.close()



