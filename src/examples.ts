function get_example(example:string):string {
    var choice = '';

if (example == "basic") {
  choice = `C = [t:9, tr] n [k:13, kr] m r s [p:12, pr] ch h w y
L = ee oo aa ii uu
V = a i e o u L
F = n r s
$S = CV(F)
words: (V)$S, $S, (V)$S$S, (V)$S$S$S, (V)$S$S$S$S, V
graphemes: ee, oo, aa, ii, uu, ch
BEGIN transform:
nn, nm, np, sh, ss → ny, m, mp, s, s
#aa#, #ee#, #ii#, #oo#, #uu# → a, e, i, o, u
END`;

} else if (example == "australian") {
  choice = `; This does not represent a single Australian language, it does something
; Australian looking. The glottal stop and lack of retroflex stops make it
; not an 'average' Australian language word list, but not unusual.

; I use <ṫ ṅ> for [t̪ n̪], <R> for length and <@> for coda-matching.
; <ṫ  c ʔ ṅ  ɲ  ŋ  r  ɻ ʎ  j> romanise as...
; <th j ꞌ nh ny ng rr r ly y> at the end.

; CONSONANTS:
; p ṫ t   c k ʔ
; m ṅ n   ɲ ŋ
;     r ɻ j w
;     l   ʎ

; The following consonant clusters are permissible:

; <k / t> + <p>
; <ṫ / ṅ> + <ʔ>

; [nasal] + [homorganic stop]

; <ɻ> + [peripheral stop] / <ʈ>
; <ɻ> + [non-palatal nasal] / <ɳ>
; <ɻ> + [non-palatal nasal] / <ɳ> + [homorganic stop]

; <l> + [non-apical stop]
; <l> + [peripheral nasal]
; <l> + [nonapical nasal] + [homorganic stop]

; <r> + [peripheral stop]
; <r> + [peripheral non-palatal nasal]
; <r> + [peripheral nasal] + [homorganic stop]

; Initials:
I = k, p, m, w, ^, c, ŋ, j, t, ɲ, n, ʎ, ṫ
J = k, p, m, w, c, ŋ, j, t, ɲ, n, ʎ, ṫ ; For disyllabic words
; Medials
C = k, m, ɻ, l, r, n, c, p, ŋ, t, ɲ, ṫ, w, j, [ṅ:3, ʎ:3, ʔ]
; Clusters
X = lk rk ɻk ŋk ɻm lm rm ɻɳ lc rc ɻc ɲc kp mp lp rp ɻp tp
Y = lŋ rŋ ɻŋ nt ɻʈ ṅṫ lṫ ṅʔ ṫʔ lṅ
Z = ɻŋk ɻmp ɻɳʈ ɻɲc lŋk lmp lɲc lṅṫ ɻŋk ɻmp ɻɳʈ ɻɲc rŋk rmp rɲc
F = n l r ɻ 
; VOWELS: <a aa i ii u uu ee oo>; and diphthong <ai>
V = a, i, u, [oR, eR, aR, iR, uR, ai]
W = a, i, u

; Syllable shapes: (C)V(F), CVFNCV. (C is optional ONLY word initially).
; <l r ɻ ṅ> DON'T occur word initially. ONLY <n ɲ l r ɻ> occur word finally.
; Disylabic words DON'T begin with a vowel. NO monosyllabic words
$I = IV
$S = [C:12,@X:2,@Y,@Z]V
$J = JV
$Z = CW(F)

words: $I$S$Z $I$S$S$Z $I$S$S$S$Z $J$Z $I$S$S$S$S$Z

graphemes: a aR e eR i iR o oR u uR p ṫ t c k ʔ m ṅ n ɲ ŋ r ɻ j w l ʎ

BEGIN transform:
; Long vowels become short before a consonant cluster or <ʔ>
aR@ aRʔ eR@ eRʔ iR@ iRʔ oR@ oRʔ uR@ uRʔ -> a@ a@ e@ e@ i@ i@ o@ o@ u@ u@ 

; Restrict the occurance of <ai>
aiʔ aic aiŋ aiɲ aij aiw aiʎ aiɻ ai@ -> aʔ ac aŋ aɲ aj aw aʎ aɻ a@

ji ʎi wu jiR ʎiR wuR -> ^REJECT ^REJECT ^REJECT ^REJECT ^REJECT ^REJECT

; Remove leftover markup
@ -> ^

; Romaniser:
oR eR iR uR aR -> oo ee ii uu aa
r, ɻ, ṅ, ṫ, ʔ, ŋ -> rr, r, nh, th, ꞌ, ng
ɲ ʎ j c ʈ ɳ -> ny ly y j t n`;

    } else if (example == "japanese") {
        choice = `; Japanese-like based on interpreting wikipedia.org/wiki/Japanese_phonology 
; and link.springer.com/content/pdf/10.3758/BF03195600.pdf

; <X> gives me onsetless morae.    <R> gives me long vowels
; <N> is the syllable final nasal. <Q> gives me geminate consonants

C = k, t, s, r, n, ^, h, m, d, g, z, b, w, p
I = k, ^, t, s, n, m, h, d, g, r, z, b, w, p
V = a, i, u, o, e, [oR, aR, iR, eR, uR, yu, yo, ya, [yoR, yuR, yaR]]
F = N, Q

$S = CV(F) ; Gives type C(y)V(R)(N,Q).
$A = IV(F) ; First syllable of slightly different consonant distribution.

; # Where light syllable is (C)V, and heavy is (C)[VF,VR(F)].
; # The final two syllables are least likely to be light + heavy.

words: $S $A$S$S $A$S$S$S $A$S$S$S$S $A$S

graphemes: a b ch d e f g h i j k l m n o p r s sh t ts u w y z

BEGIN transform:

; "Yotsugana": <dz> and <dj> neutralise to <z> and <j>
sy zy ty dy wy -> sh j ch j y
si zi ti di -> shi ji chi ji
tu du hu -> tsu zu fu
wi we wo -> i e o

Na Ne Ni No Nu -> n'a n'e n'i n'o n'u

Qch Qsh Qts Qk Qs Qt Qh Qp Qf Qw -> Qtch Qshsh Qtts Qkk Qss Qtt Qpp Qpp Qpp Qpp
Nb Np Nm -> mb mp mm

RQ N Q -> ^ n ^ ; <R> + <Q> is illegal.

; Vowel sequences:
aa au ao ia ii iu -> a oo ai ja i yuu
ea ee eu ee eo -> e e yoo e yo
oa oo ua uu ue uo -> o o a u ai ai

aR eR iR oR uR -> aa ee ii oo uu ; Get long vowels

; Collapse aa ee ii oo uu words into short vowels.
#aa# #ee# #ii# #oo# #uu# -> aa ee ii oo uu
`;

} else if (example == "romance") {
  choice = `; ; # Spanish-like

; Initial-cluster: pl pr tr cl cr bl br dr gl gr
; All-consonant: t s k q d n b m p l r g h č f z

; Vowels: a e i o u
; Diphthongs: aj aw ej ew oj ja je jo ju wa we wi
; Hiato: ea eo oa
; Triphthong = jaj jej joj jaw jew jow waj wej waw

; Word-internal coda: n r l s m
; Word-final coda: n r l s d z

; rare: ywi, yoi, yaw, od#, yja, yje, yjo, yju

optionals-weight: 30 %

C = [t:9,tr] s ^ [k:9,kr,kl] [d:9,dr] n [p:9,pr,pl] l m r [b:9,br,bl] q g h [č:12 f z]
V = a i o u e
F = n r l s m d
X = n r l s d
T = '
$S = CV(F)
$X = CV({T:1},{^:3}F) ; 2nd last 85% 
$Y = CV({^:80},{^:95}F) ; 2nd last 85% 
$Z = CV({T:3},{T:9}X) ; last: 9%

words: $Y$Z $X$Y$Z $S$X$Y$Z

BEGIN transform:

a' e' i' o' u' -> á é í ó ú

; Enlace y Hiato
%   a  e  i  o  u
a   a  aj aj o  aw
e   ea e  ej eo ew
i   ja je i  jo ju
o   oa e  oj o  u
u   wa we wi wo u

aa ae ai ao au ea ee ei eo eu
ia ie ii io iu oa oe oi oo ou
ua ue ui uo uu

qwa qwo qwu qa qo qu -> cwa cwo cwu ca co cu
mk mq mg mč md mf mh -> nk nq ng nč nd nf h
ml mm mr mt mz -> nl ň r nt nz
nb nh nm nn -> mb h ň ň 
ll ln -> ʎ ʎ
ss -> s
jg jl jn -> ň ʎ ň
nj lj gj qw -> ň ʎ ň q

; Taco-taco, burrito-burrito
k q č h ň ʎ j w -> c qu ch j ñ ll i u
`;

} else if (example == "tonal") {
  choice = `; # Tonal Yoruba-like
I = k t ^ [p,f] n r b m s l d c ç ş h y w g [kp,gb]
C = t k [f,p] n r b m s d h l ŋ g c ş ç l y w [mb,nd,ŋg] [kp,gb,ŋgb]
V = a i e o u
W = a i ẹ ọ u
T = ^:1.5 \` '

$S = CVT
$Z = CWT

$I = IVT
$J = IWT

words: $I$S $I$S$S $I$S$S$S $J$Z $J$Z$Z $J$Z$Z$Z

graphemes: ẹ́ ọ́ ẹ̀ ọ̀ kp gb
BEGIN transform:
a' e' ẹ' i' o' ọ' u' -> á é ẹ́ í ó ọ́ ú
a\` e\` ẹ\` i\` o\` ọ\` u\` -> à è ẹ̀ ì ò ọ̀ ù
END`;
    }

    if (choice == '' || choice == null || choice == undefined) {
        return '?';
    } else {
        return choice;
    }

}

export { get_example };