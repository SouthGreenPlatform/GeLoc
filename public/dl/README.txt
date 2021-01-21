Description of fasta files :
---------------------------------

**files "Peptides" and "CDS"** : These files contain amino acid and nuclotide sequences for LRR-CR genes. 
For genes experiencing frameshift, the one or two bases that cause the frameshift are avoided in order
to have nucleotide sequence that can be translated.


**files "cDNA"** : These files contain nucleotide sequences for the complete LRR-CR genes without intron. 
In the case of genes experiencing frameshift, the sequences cannot be translated in comprehensive protein 
sequences. For all other genes, the files "CDS" and "cDNA" retrieve the same nucleotide seqences.


**files "cDNA_wFrameshift"** : These files contain nucleotide sequences of non-canonical genes. In the case
of genes experiencing frameshift, the sequence is completed with one or two "!" characters at the position
of the frameshift in order to conserve the right reading frame (also used by V. Ranwez et al. for the 
MACSE programs). The translation of these sequences will create amino acid sequences with frameshift 
caracterised by an "X" character.