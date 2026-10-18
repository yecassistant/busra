/* Eros'un Oku – Büşranur için ok bulmacası */
(function () {
  "use strict";
  var LEVELS = [{"w":4,"h":4,"a":["1,0:DD","0,3:RR","3,0:D"]},{"w":5,"h":5,"a":["0,2:R","2,3:UU","2,4:R","1,3:D","0,3:D","3,3:U","4,1:DD","1,1:UR","3,1:U","0,1:U"]},{"w":5,"h":6,"a":["1,2:DD","2,2:R","1,5:LUU","0,2:UR","2,1:RRD","2,4:DRR","2,3:RR","1,0:L","3,4:R","2,0:R"]},{"w":6,"h":7,"a":["0,6:URR","2,3:DR","4,2:DD","3,2:D","4,6:L","1,3:DL","3,5:RRD","4,1:LLD","2,0:LDD","5,4:UUU","5,0:LL","0,2:D","0,0:D"]},{"w":6,"h":7,"a":["2,5:UUL","5,4:LL","3,5:DR","4,5:RD","0,1:DDD","3,1:D","1,1:D","1,4:DDL","3,3:R","3,0:RDD","1,0:RD","5,1:DD"]},{"w":7,"h":8,"a":["3,2:ULDL","0,3:RRRR","2,0:R","3,4:RDD","6,0:DLDD","3,7:LUUU","0,1:R","4,0:D","0,7:UUUR","6,7:UUUU","5,4:DDD","1,7:UU","0,0:R"]},{"w":7,"h":8,"a":["4,5:U","4,2:DLD","3,5:LU","6,4:UUU","3,6:RRU","5,4:UUUL","2,1:LDDD","3,2:UUL","0,6:RRDR","1,5:LUU","4,7:R","4,0:RR","6,7:U","1,7:L","0,2:UU"]},{"w":7,"h":8,"a":["4,3:DLLU","4,1:LDD","2,2:UURR","2,5:R","1,5:D","5,0:DDDD","5,5:LDLL","1,3:D","0,4:DDDR","0,2:R","0,0:RD","6,3:DDDD","5,6:D","6,0:DD"]},{"w":7,"h":8,"a":["4,7:LUUU","3,3:LU","3,2:ULL","1,4:UULU","2,5:U","1,7:RULU","4,4:UU","0,7:UUU","5,4:DDD","6,0:DDLD","6,7:UUU","2,0:RRDR","0,0:R"]},{"w":7,"h":8,"a":["4,6:RULL","2,7:UUUR","3,7:U","6,2:DDD","4,4:RUUU","5,7:L","0,7:UUUR","2,2:DL","4,0:DDD","3,2:UU","1,7:UU","0,1:DD","1,2:UUL","2,0:D","6,6:D","6,0:D"]},{"w":7,"h":9,"a":["3,7:UUUU","3,0:LDD","2,4:UL","3,2:URRU","4,3:URD","1,4:LU","1,2:UUL","4,4:DDRR","6,4:L","2,5:LL","6,5:L","2,6:D","6,2:D","3,8:LLUU","6,0:D","4,7:DRUR","0,8:UU"]},{"w":7,"h":9,"a":["2,2:DD","1,3:DD","2,6:RUU","3,3:URD","1,2:L","4,4:DDDL","6,0:DLLL","6,5:UUUL","6,7:ULUU","0,3:DDDD","2,0:R","1,0:D","2,7:LDL","0,0:D","6,8:LU"]},{"w":7,"h":9,"a":["4,5:L","4,2:DD","4,6:RR","3,6:LUUU","6,2:LDDD","3,4:UUL","1,7:RRR","5,7:D","1,4:UUUR","0,8:RRRR","1,0:RRDR","0,6:RU","0,2:DDD","6,8:U","5,0:D","6,1:U","0,1:U"]},{"w":7,"h":9,"a":["4,3:LLLL","3,4:DD","4,4:DDDL","1,2:RRR","1,4:LDDD","5,3:D","1,7:UURU","1,0:LDRR","6,2:UU","3,1:RRU","0,8:RRU","6,4:DDLD","5,8:LL","6,8:U"]},{"w":7,"h":9,"a":["2,4:DDL","2,1:RDD","2,3:LUUU","4,7:UUU","0,5:RU","3,4:D","6,3:LL","4,2:U","6,7:LUUU","5,8:LLUL","0,3:UUU","6,2:L","5,0:LLL","6,0:DL","1,8:U","0,8:UU"]},{"w":7,"h":9,"a":["3,3:DD","0,1:DDRR","2,4:DDR","2,2:ULUL","6,2:LLL","1,4:DDD","2,0:R","4,3:DDDD","0,6:UU","3,1:RU","5,8:LLUL","5,3:DDDR","6,0:LD","2,8:LL","6,8:U"]},{"w":7,"h":9,"a":["3,4:RR","6,4:DLLL","5,6:LL","6,3:LLL","1,4:DD","0,7:RRUU","2,4:UU","3,7:DLLL","0,1:DRD","3,2:UUL","6,1:DLL","6,8:LLUR","6,0:LDL","2,1:LUL"]},{"w":7,"h":9,"a":["0,2:DRR","2,4:RRU","3,3:UURR","2,2:UURR","4,2:RRUU","0,0:DRD","0,4:RDRD","3,8:UUU","4,6:U","6,3:LD","0,6:R","6,4:DLDD","0,7:RR","6,8:LLU","0,8:RR"]},{"w":7,"h":9,"a":["3,5:RDDR","3,6:DDRR","5,5:DRDD","0,4:RD","2,6:DL","6,2:DLL","5,4:LL","2,5:UUU","6,1:LDLL","1,6:LDD","6,0:LLDL","2,1:LDDL","2,0:R","0,0:DD"]},{"w":7,"h":9,"a":["3,4:DL","1,5:D","1,4:LDDD","0,3:RRR","0,8:RURR","4,4:UUUU","6,2:DDL","5,5:RDDD","1,2:RR","4,8:U","2,6:RRRD","1,1:RUR","0,2:UU","6,0:LDDD"]},{"w":8,"h":10,"a":["7,3:LLLD","3,3:UU","6,6:LLUL","6,2:LL","6,5:LU","6,4:RDDD","2,5:DDRR","3,4:LLDL","0,3:RRU","2,0:RRDR","5,7:DDLL","1,2:LUU","4,8:LLDL","5,0:RDR","0,9:UUU","1,0:DR","6,7:DDR"]},{"w":8,"h":10,"a":["1,5:RR","3,6:RRRU","2,7:RRR","0,9:UUUR","4,5:UURR","2,4:L","3,3:D","5,5:URRU","3,8:L","3,9:LLUU","3,2:RRR","4,1:LLD","2,3:LU","7,9:LUU","0,1:DDDD","5,9:ULD","6,1:ULLL","2,0:LL","7,2:U"]},{"w":8,"h":10,"a":["2,5:R","5,5:DLL","4,5:U","3,4:URR","0,6:UURR","7,4:LDD","4,7:LLUL","0,9:RRRU","4,8:RRUR","7,3:ULLL","3,2:URR","0,3:RUU","2,3:UU","2,8:LL","1,7:L","0,2:UURR","4,0:RRDR","5,9:L","7,8:D"]},{"w":8,"h":10,"a":["4,7:UUU","4,3:L","2,4:UU","6,3:DD","6,1:LDDD","3,6:UU","0,3:DRD","5,5:DDDD","2,0:RDDR","3,7:LLL","6,2:RDDD","0,8:RRRR","1,6:RU","7,6:DDLD","0,0:DDRD","4,1:URRR","1,9:RRR","1,0:DR"]},{"w":8,"h":10,"a":["7,3:LLL","1,3:URR","0,3:DRR","1,5:RRUU","0,2:URRR","4,2:RRU","1,6:RR","4,5:UR","5,5:RDD","4,1:RULL","0,7:RRR","6,9:LLUU","6,4:RDDD","1,0:L","4,6:RDDR","7,2:U","7,0:L","0,9:UR","2,9:UR","7,8:D"]},{"w":8,"h":10,"a":["1,4:R","0,3:DDR","4,5:LUU","4,4:UULL","2,5:D","0,7:RRRU","5,4:R","1,3:UUUL","5,6:L","5,5:RDD","1,6:L","2,9:RRUL","5,3:RRDD","2,8:L","2,1:UR","5,7:DDRR","7,0:DDLL","3,1:RU","0,9:R","5,1:U","7,8:L","6,0:D"]},{"w":8,"h":10,"a":["4,7:RRRU","2,6:R","3,7:LLUU","4,5:ULLL","7,5:LL","4,8:L","4,9:RU","3,3:LLLD","2,9:U","6,4:RUU","5,4:U","0,6:DDD","4,3:UUUR","0,2:RRRU","7,9:UL","5,2:URRU","1,9:U","1,0:RR","0,0:DRR"]},{"w":8,"h":10,"a":["4,4:L","3,5:DLDL","2,5:UURR","7,3:DLLD","3,2:RRD","4,6:U","1,5:UUUU","4,7:L","5,6:DDDL","0,0:RRDD","6,5:RDDD","6,3:UUUR","6,6:DDDR","0,4:UU","0,8:RRRR","3,0:D","5,0:DL","3,9:LLL","0,6:R"]},{"w":8,"h":10,"a":["2,5:R","4,7:UUUR","6,4:D","3,6:DDDR","5,6:RRUU","2,7:U","7,2:DLLL","2,4:RU","0,3:DDD","6,7:LDL","1,3:DD","1,6:DDRD","6,8:DR","2,3:ULU","6,2:UUR","3,1:LUL","5,1:DLL","4,1:U","0,7:DD","0,0:DD"]},{"w":8,"h":10,"a":["5,4:LLL","6,5:L","6,3:L","4,7:UU","4,3:LLLD","1,6:RURD","7,4:L","5,2:RR","5,1:UR","3,2:RU","5,7:UR","7,6:DLDL","4,8:LLL","5,9:LLLL","2,7:LLDD","2,1:RUR","0,0:DDRR","1,5:L","7,9:L","7,0:D","1,0:D"]},{"w":8,"h":10,"a":["6,6:UL","4,7:UUUR","3,5:U","5,7:U","4,3:LLDD","3,6:LLDD","4,8:RDR","0,5:RU","3,7:LDDL","6,1:DDDR","5,3:ULLL","1,1:RR","7,5:DDDD","3,9:U","1,3:ULU","2,0:RRDR","7,0:DDD","0,9:UU","1,0:L"]},{"w":8,"h":10,"a":["2,4:UU","4,4:D","3,4:DDRD","0,6:RRU","5,5:DDDL","3,7:DDR","6,9:UUUU","5,4:UUR","2,1:RDD","6,4:RUUU","2,0:RRDD","1,1:DDLD","1,4:DL","2,8:D","1,8:UL","7,9:UUUU","0,0:DD","5,1:URR","0,8:D"]},{"w":8,"h":10,"a":["3,3:RRDD","1,2:DDRR","1,0:RDDR","4,4:DDDR","4,2:RRR","0,3:DDRR","3,0:DRRU","2,9:RUUU","6,7:UU","1,9:UUR","6,1:R","7,4:LU","0,0:DR","1,6:R","7,0:L","0,7:DD","7,8:UUU","4,8:DRRR"]},{"w":8,"h":10,"a":["4,5:RRR","4,6:LUUU","4,4:UUR","1,4:D","5,4:RRUU","5,6:RRDD","7,9:LLLU","2,3:DDDL","5,8:ULL","5,3:RUUR","4,1:URRR","3,8:LLLU","0,6:U","1,3:LU","0,0:RDDR","3,1:U","2,0:D","1,9:RR"]},{"w":8,"h":10,"a":["4,6:U","4,2:RDDD","5,7:LLUU","5,6:RR","4,3:LL","4,4:L","6,5:R","4,8:RD","1,5:UU","2,5:U","2,9:UUUL","3,2:LLLD","7,4:LU","4,1:LLL","3,9:U","7,3:UUUL","7,7:L","1,8:L","1,7:L","6,9:U","7,9:U","6,2:ULUL","3,0:L","0,0:D","1,9:L"]},{"w":9,"h":11,"a":["4,6:ULL","1,4:RRR","2,6:LLUU","5,7:U","4,7:DD","3,6:DD","7,4:DLL","5,4:UURR","5,0:LDD","2,7:DDDR","6,4:URRU","6,10:UUUU","7,8:URUL","3,2:LLLU","5,10:UU","0,3:RRRR","1,8:ULD","8,8:DLD","5,1:RRRU","3,0:LLL","1,10:UL"]},{"w":9,"h":11,"a":["3,6:LURR","3,4:RRDD","3,7:RR","0,8:RUU","3,3:LDL","5,8:RUUU","2,9:UU","4,8:DR","0,3:DDR","6,4:RDDD","3,8:DDRR","0,2:RRRR","4,3:RRUU","8,6:UUUU","0,9:RDR","3,0:RRRR","0,0:DRR","7,10:UURU","7,2:URU","6,10:U","8,10:U"]},{"w":9,"h":11,"a":["4,4:LUUU","7,5:LLL","5,3:D","2,4:LDD","5,7:LULU","4,2:RR","2,3:UUUR","5,6:RRD","2,5:DDLL","6,4:RRUU","1,2:D","1,9:RRUU","0,6:UUU","4,0:RRRR","6,7:DDDR","1,1:UL","8,1:LDDL","3,10:LL","4,8:D","0,10:UURR","8,7:UU","5,8:D","8,10:ULUR"]},{"w":9,"h":11,"a":["4,5:RRRR","4,3:LDD","4,7:LDR","8,7:ULLL","4,4:RR","2,8:UUU","1,5:DDD","1,3:URRR","5,7:D","0,5:DDD","5,10:RUUU","6,2:RRUL","6,3:LUU","7,7:D","2,4:LL","4,1:LLLL","6,1:ULL","8,3:LD","2,9:RRR","3,10:LLUL","8,8:DLDR","3,0:LLL","8,0:L"]},{"w":9,"h":11,"a":["4,5:LD","6,5:LDL","3,4:LD","5,4:L","2,6:DRRR","4,3:RRDR","7,5:RUUU","6,6:RRDD","2,8:LUUU","0,3:RRR","1,9:RRR","5,9:UL","1,4:LD","0,6:DDDD","4,2:LLL","3,1:LLLD","4,1:RRRR","6,7:RDDR","5,10:LL","6,8:DDRR","3,0:LLL","8,0:LLLL"]},{"w":9,"h":11,"a":["4,2:DDD","5,6:LLU","5,5:UUUU","3,3:L","3,4:LLLU","1,7:RRR","6,5:DDD","6,4:URRD","0,6:RRU","3,2:LLL","7,4:DDDR","1,5:L","5,8:LDD","3,8:DLL","2,8:LLD","0,1:RRRR","7,0:LLLL","8,10:LLLU","7,2:LURR","0,10:RRR","6,9:RUR","2,0:LL"]},{"w":9,"h":11,"a":["3,4:D","5,5:L","3,3:LUUU","0,6:RRR","5,4:RDD","4,6:RDR","3,1:DRDD","2,5:ULUU","7,5:RDDD","0,4:D","3,8:L","6,3:RDRU","4,9:LLLU","4,7:DRRD","5,2:D","3,7:LLLD","7,6:DDDR","4,1:RRRR","6,2:RR","6,10:LLL","1,1:UL","4,0:RRRR","2,10:LL","8,10:L"]},{"w":9,"h":11,"a":["6,2:LDD","4,4:DRRD","5,0:LDDD","7,4:UL","3,4:D","5,6:LL","1,0:RDDD","2,4:DDDR","7,5:DDDR","3,0:DD","8,0:LDLL","1,7:UUU","1,3:LUUU","8,2:L","6,7:LD","0,4:DDD","0,8:RRRR","6,8:DLL","3,9:DRRR","7,10:URD","2,10:ULL","0,10:R"]},{"w":9,"h":11,"a":["5,4:DD","4,5:DDDR","2,3:RRDL","8,2:LLD","2,7:RUU","6,5:DDD","6,4:RR","3,1:DRRD","2,4:LU","7,6:DDDL","8,5:L","0,8:UURR","2,5:LLUU","4,1:ULLL","6,1:L","8,3:L","8,6:D","5,9:DRRR","3,8:LLD","4,9:LLDL","0,0:DDR","5,0:RRDR","0,9:D"]},{"w":9,"h":11,"a":["5,5:D","4,6:UURR","5,7:RUU","7,6:D","5,9:ULLU","4,3:LL","1,7:UR","3,4:LLUU","5,2:LLLU","8,6:DDLL","3,6:ULLL","8,3:LLL","8,4:LD","5,10:LLLL","3,9:LULL","5,1:LLUL","0,4:UU","7,9:LD","8,1:LULL","8,2:LL","0,10:UR","8,10:L","0,1:R","1,0:L"]},{"w":9,"h":11,"a":["6,4:DLL","1,5:DRRR","4,7:RURR","4,4:RURU","0,9:RRUR","1,4:RRDL","4,9:R","0,5:DDRR","5,8:RD","8,6:DDD","0,2:RRRR","0,3:RRRR","7,7:DDDR","0,8:R","6,1:RDDD","8,5:L","4,1:RURR","5,10:R","0,10:RRRR","8,2:DD","0,0:DRRR","8,0:D"]},{"w":9,"h":11,"a":["3,3:DLDR","6,5:LLUU","5,3:ULL","5,6:D","2,3:U","3,7:DR","2,9:UUU","6,4:RD","1,4:LUU","0,5:RD","3,9:DLLL","5,9:URUU","4,1:LLLL","6,3:RRDD","0,7:R","4,9:DRRR","0,0:RRR","7,6:DRD","1,8:DL","6,0:DDR","5,1:U","7,8:DRD","8,0:DD","7,0:D"]},{"w":9,"h":11,"a":["3,4:RRRR","3,2:DR","3,5:L","1,6:UU","2,3:LLDD","5,3:RRRD","8,6:LLUL","4,5:DD","6,1:LLL","2,0:DD","5,6:DDDL","0,8:RURR","5,0:L","4,2:RRRU","1,2:UU","8,5:L","3,8:DLLL","0,0:DD","8,0:LL","6,7:RRD","3,10:LLL","8,10:LLL","6,8:DRR"]},{"w":9,"h":11,"a":["5,4:RDD","5,6:DRRU","5,5:L","4,6:LUL","7,8:LLLU","7,3:L","7,5:UR","8,8:UU","3,7:LLDD","4,4:UUU","5,3:UUUL","1,3:DDD","6,2:URUR","5,9:DRRR","3,0:DDDD","2,4:UULL","3,8:DDLL","6,9:R","0,5:UU","4,10:U","0,10:UUUU","8,2:L","2,1:LUL"]},{"w":9,"h":11,"a":["4,6:DLL","5,5:DR","2,6:LDD","3,6:UULL","4,3:DD","6,5:RD","5,4:U","5,8:RRD","8,5:DDLL","4,9:RRDR","4,8:LLDL","3,9:DLLL","3,3:URRR","2,5:LLU","7,4:RUU","4,1:R","6,3:RUUU","0,2:DRR","4,0:RRD","8,10:U","0,0:RDDR","2,0:DR","8,1:U"]},{"w":9,"h":11,"a":["4,8:UUUU","3,4:D","2,4:U","2,1:DRDR","0,2:DDR","3,6:DDDR","1,6:RU","5,3:UUU","5,5:URU","0,6:U","1,2:UUL","3,0:D","4,2:UU","7,3:UU","8,1:DDD","2,7:LL","6,2:UURR","5,9:UUU","6,9:UUUU","7,7:UUU","0,10:RUU","4,10:LLUU","8,5:DDDD","8,10:LUU"]},{"w":9,"h":11,"a":["4,5:L","1,5:DRRR","6,7:LUUU","3,3:LDD","4,4:URRR","8,4:LLDD","5,0:DDL","4,10:UU","4,7:LLL","7,6:UR","5,9:U","2,8:LLUU","0,5:U","3,2:LLL","0,0:RRRR","4,1:LLLL","5,10:R","1,4:UL","6,8:DRD","3,10:UU","6,2:UURR","8,10:UUUL","8,3:ULUR","2,9:DLUL"]},{"w":9,"h":11,"a":["3,4:U","5,4:DLD","3,5:L","4,4:UUL","3,6:LLUU","2,4:UUUR","7,1:LLDD","7,7:LLLL","6,4:UUR","8,1:DDLD","5,6:R","1,2:DLD","4,1:ULLL","0,7:RRDR","4,8:D","8,7:UULL","0,0:DD","8,0:LLL","3,9:DR","5,9:URDD","2,9:DLL","0,8:R","0,9:R","7,8:DDR"]},{"w":9,"h":11,"a":["6,5:LLL","6,4:LLL","3,6:LLLU","2,5:UU","1,3:DD","5,6:LDL","3,3:ULL","0,9:URRU","5,7:R","4,2:DR","1,7:L","6,6:RDD","3,8:D","7,9:LLUL","7,5:RDDD","0,4:UU","4,9:DL","4,0:LLLL","0,10:RRU","3,1:LLL","5,2:UUR","7,0:DLDD","7,4:RUUU","8,10:LLL"]},{"w":9,"h":11,"a":["3,8:UUU","4,4:DDD","3,4:LU","7,5:ULLD","1,3:DDR","3,3:RULL","2,7:DD","0,6:RR","5,6:DDLD","6,5:D","1,2:URRR","0,4:UUUU","5,2:RUU","5,3:RRUU","6,10:LLLU","8,0:DDDD","8,5:DLD","6,7:DDR","0,7:R","1,9:ULDD","5,1:U","8,7:DDD"]},{"w":9,"h":12,"a":["4,7:UL","2,7:LUU","2,6:UULL","4,3:LD","3,7:D","5,3:DLDL","5,7:R","8,7:ULLL","7,3:DDLL","0,5:DD","3,9:R","4,8:RD","2,8:LLD","0,11:RRR","4,10:RRRU","3,10:LLL","8,10:UULU","2,3:LU","1,0:DRDR","4,11:RRRR","6,4:UUUR","4,2:RUU","4,0:D","8,4:UUUU","3,0:D","0,1:DD"]},{"w":9,"h":12,"a":["4,6:UL","6,3:DDD","3,6:DLUU","5,6:UUL","5,7:L","6,8:LD","7,10:UUUL","3,4:LLDD","3,8:LL","7,6:RDD","7,5:U","4,8:DLLL","7,2:DRDD","4,3:LLU","5,3:URUR","5,10:DRRR","5,1:URR","2,1:RR","1,7:LDDD","4,10:LLLD","0,6:UU","0,0:RRRR","8,0:D","0,2:RUL","0,3:R"]},{"w":9,"h":12,"a":["5,3:LD","3,2:DDDR","5,4:DDDL","2,4:DDD","1,5:LDD","4,6:LD","2,0:RRDD","1,1:DRD","6,7:UUR","7,4:RD","0,2:DDR","6,4:UUU","3,8:RD","1,6:DDLD","7,0:LLDD","2,8:DDLL","8,0:DDL","3,9:DR","8,3:L","8,6:DDDD","7,6:DDDD","5,8:DDD","6,8:DDDR","4,11:LLLL","0,0:D"]},{"w":9,"h":12,"a":["3,6:R","3,5:RRD","1,5:D","0,8:RURR","3,8:DDLL","1,3:RRDR","0,4:RRDD","2,8:DLLD","6,2:DDDD","5,7:RRU","4,7:DRRR","5,4:U","7,5:URDD","3,2:URRR","8,9:LLL","4,9:DDRR","0,11:RRR","0,3:UUU","5,10:RRRD","2,1:UR","1,0:DDR","7,3:RUUU","7,2:UU"]},{"w":9,"h":12,"a":["4,5:RU","3,5:U","4,4:UUL","6,6:LL","5,3:U","7,7:UULU","6,8:UL","3,3:LUL","2,8:UUUU","4,8:U","3,6:DDDL","0,7:UUR","8,7:UUUL","6,2:ULLL","4,10:RUU","1,3:LUU","7,2:UULL","1,4:L","2,1:ULL","8,1:DDLL","0,10:URUU","8,11:UUUL","7,11:UU","4,11:RRU","3,10:LLDL"]},{"w":9,"h":12,"a":["2,5:RR","6,6:LU","6,5:UL","3,6:LLL","4,7:U","5,3:LDLU","6,9:LUL","7,8:UUU","1,2:DD","1,5:LUUU","2,10:RUUU","2,4:UURR","6,2:LURR","0,0:RRRR","7,4:RUUU","8,5:DDDD","4,10:U","2,7:LD","0,1:RRRR","2,8:DLLD","5,0:RRR","7,11:RULU","4,11:RUR","0,11:RR"]},{"w":9,"h":12,"a":["5,5:LL","4,4:U","6,5:ULU","7,3:DD","5,6:DDRR","3,4:UURR","4,6:DDD","2,5:DDD","6,3:UULL","7,7:RUU","2,4:UUUU","3,6:DDD","0,1:DDRD","8,4:UU","8,0:LLL","7,2:UR","0,4:DRDD","2,9:DRRR","3,1:U","6,9:RD","1,11:RRRR","0,7:U","6,10:DR","8,8:DDD","0,0:RDD","0,8:R","1,10:ULD"]},{"w":9,"h":12,"a":["3,5:DD","3,8:D","3,4:LDD","5,7:U","0,9:URUR","3,10:RUUU","2,8:DDDL","0,6:R","4,6:UURR","5,8:R","6,6:RRDD","3,11:R","6,5:RUU","1,9:DLD","6,7:RDDR","5,9:DDR","0,5:R","5,3:LL","2,3:URR","1,4:LU","4,1:RDRD","6,9:DRRD","3,1:URRR","0,0:RDR","7,1:DRDD","0,2:R","7,0:R"]},{"w":9,"h":12,"a":["3,5:UUU","3,8:RUUU","6,3:LL","1,5:RU","4,4:R","4,2:UULL","5,5:RURU","1,4:UUUU","8,3:ULLL","3,6:LL","8,8:LLUU","3,7:L","5,8:UU","8,5:L","4,9:RRRR","0,3:DDDD","5,10:LLU","8,1:LLL","1,7:DL","8,6:L","2,10:DRRR","8,7:L","8,0:LLL","1,9:RU","0,0:DD","8,10:LDLU","0,9:D","1,10:DL"]},{"w":9,"h":12,"a":["4,6:RRD","2,4:RDR","5,5:U","3,6:LULU","4,7:DRRD","3,7:LL","4,4:URR","0,8:UUR","3,8:LDLL","6,2:LL","7,6:UUU","0,3:DD","8,2:DDDD","5,9:DRRR","4,9:DDRR","7,2:ULLL","2,2:ULL","3,1:ULLL","4,0:RRR","0,2:RDRR","8,7:LD","0,11:URRR","8,9:L","7,11:R","8,0:D"]},{"w":9,"h":12,"a":["3,5:R","2,5:UUR","3,4:RUU","2,6:L","0,7:UUR","3,7:URRU","5,4:RRRU","0,4:R","6,6:URR","3,10:LUUU","8,7:LLLL","5,3:URRR","7,8:LLLL","3,2:UURR","3,11:RUUL","0,10:UURU","0,1:DR","5,9:RDDR","5,1:RURR","2,2:UULL","0,3:R","8,6:L","8,1:L","5,10:D","0,11:RU","7,9:DRD"]},{"w":9,"h":12,"a":["0,7:RR","3,7:D","3,5:RDDR","3,6:LUU","7,7:DLLL","1,10:URR","5,6:RRRD","3,10:RRUR","2,8:LL","3,3:LLD","4,2:DDL","7,3:LLDD","1,5:L","1,6:L","4,11:LL","3,2:UL","7,5:LU","0,9:DD","0,1:DDD","4,1:URRR","8,1:LLLD","8,8:DD","2,2:LUUL","7,9:DLD","8,4:L","8,2:LL","8,11:L"]},{"w":9,"h":12,"a":["3,7:RUU","4,4:URRU","5,5:U","3,6:LLD","3,1:DDDD","0,7:UURR","6,4:RURD","4,2:URR","5,6:RRRD","6,5:RR","2,7:DLLD","6,7:DRRD","2,4:L","2,3:UUL","1,10:URRR","4,8:RDDR","4,0:RRRD","0,0:DDDD","7,2:RUU","1,11:RRRU","7,9:DDR","0,10:D"]},{"w":9,"h":12,"a":["5,6:DDDD","4,6:URU","6,6:UUUL","6,7:RRU","4,10:UU","2,6:DRR","4,4:LLU","8,4:DL","4,3:LUL","6,8:RD","1,6:UUUU","4,11:RRUU","3,8:LL","8,1:DDL","4,1:DR","6,2:UURR","0,9:UUR","0,6:UUUU","1,11:RRUU","7,10:DR","5,1:ULLL","0,11:URU","3,1:LLLU"]},{"w":9,"h":12,"a":["3,4:RU","5,5:UR","5,7:LU","4,5:L","5,3:UUL","2,5:LL","4,2:L","3,3:LUUU","0,7:RRRU","7,4:DDD","6,2:D","2,4:LUUU","8,8:LLLL","4,0:RR","8,7:UU","1,6:R","3,1:U","8,0:DLL","0,4:UUU","8,4:ULUR","3,11:UUU","2,8:L","4,9:RRR","4,11:URRR","1,0:L","7,11:LL","1,10:RU","1,9:LDD","8,11:UU"]},{"w":9,"h":12,"a":["3,6:URUL","4,3:L","5,1:DDD","2,4:U","0,8:RRRU","0,3:RURR","1,5:R","2,6:DLL","5,6:RD","0,6:R","2,9:RRUU","6,5:UUUR","1,4:L","3,1:RURR","5,7:DDRR","7,3:RUUU","8,4:LD","3,0:L","6,1:RU","8,5:DDDD","0,0:DRR","4,10:LL","6,10:LDLL","1,9:DDL","8,10:LDL"]},{"w":9,"h":12,"a":["5,5:D","4,6:UUR","4,3:RRDD","5,7:RR","4,7:L","6,6:RRD","3,5:DLLD","5,8:RDLL","0,7:UURR","8,2:LDDD","0,8:RRRR","1,3:RRD","0,3:DRR","4,2:LLLL","6,10:LL","6,2:LULL","5,11:LLUL","5,0:LLLD","3,9:LLLD","8,1:LLU","7,10:URD","7,8:R","8,11:LL","1,10:DL","8,0:L","0,0:RD"]},{"w":9,"h":12,"a":["4,3:RDD","3,6:UUU","4,6:D","6,5:U","3,2:LDDD","2,6:DDD","5,8:LLU","1,5:LUU","5,6:DRD","7,8:UU","4,9:RRRR","8,2:LLLL","1,7:L","0,6:R","7,4:R","6,3:R","7,5:R","7,1:LLLL","1,4:UULU","6,10:LLLU","0,0:RRD","0,9:UR","3,0:RRRR","2,10:DRRR","1,9:DDL","6,11:RUR","8,0:D"]},{"w":9,"h":12,"a":["6,4:DLL","2,5:RURU","7,6:LLLL","2,6:DRR","3,3:URRR","3,8:LLUU","1,5:LDD","2,4:UULL","5,7:RR","8,7:UUL","5,4:URRU","3,1:RRRR","8,8:LLLL","3,9:LLLD","1,4:L","8,9:LLLL","8,10:LLLL","4,0:LLDL","1,3:L","7,4:RUU","2,10:LDL","8,11:LLLL","0,0:D","3,11:U","8,0:LL"]},{"w":9,"h":12,"a":["5,4:D","5,8:LUUU","5,6:RRRD","3,4:RUUU","5,3:UUUL","7,5:L","8,4:LL","3,5:LLLU","7,8:ULL","2,4:LULU","6,3:RRU","3,8:UU","2,6:DDDL","6,2:URRU","0,1:RRDR","8,10:ULLL","1,6:LDDD","5,11:LLUU","3,1:ULLL","6,11:ULLU","7,10:DR","2,10:LL","0,11:R"]},{"w":10,"h":13,"a":["2,7:RDRU","5,6:UULL","5,7:DRRU","6,7:UUR","8,9:LLLL","3,6:RU","8,10:LLLL","5,3:LLL","3,5:LDL","0,3:DDDD","1,7:DDLD","2,10:UU","3,12:LURR","9,7:UU","8,8:RDDD","9,3:DLL","6,12:LUR","2,4:LUU","6,4:UUR","5,1:LULL","5,2:LLUL","7,3:RUR","7,12:URDR","9,1:LLL","0,12:UR","5,0:RRRR","1,0:DLD"]},{"w":10,"h":13,"a":["4,6:UR","4,4:RRRD","3,5:DD","5,6:RDRR","3,2:RR","4,7:DRRR","3,3:RR","7,2:LD","2,3:DDD","7,1:RDDD","3,8:LLLU","8,5:RUUU","5,1:ULDL","7,6:RRDD","1,5:DDR","9,9:LLLL","9,0:LLLD","2,11:RRRU","1,3:LUUU","4,9:DLUL","1,4:L","6,10:RRRD","1,1:DR","9,12:LLLL","2,10:LUL","2,1:U","4,12:LLL","0,12:U"]},{"w":10,"h":13,"a":["5,5:UU","4,3:DD","4,6:RRR","3,5:DDDR","7,5:RRD","2,5:D","7,3:LDD","2,4:LUUL","4,2:L","5,7:L","9,2:DDLL","2,1:DDR","6,7:RDRR","5,2:U","2,7:DDDR","4,0:RRDD","4,12:UUUR","4,1:LULL","0,8:UURU","5,8:RDD","9,7:L","0,10:RUUU","5,10:DDRR","7,1:DRD","1,1:LU","9,0:DL","9,9:DDD","7,9:RDDD","0,12:RRRU","0,11:RR"]},{"w":10,"h":13,"a":["2,6:RRR","5,7:RU","7,6:ULLL","4,7:DLL","7,4:LLL","3,5:LUU","7,3:LLL","1,6:LUUU","2,7:LDDD","3,4:UUL","8,3:DRDD","9,8:LLLL","7,2:LLL","8,5:DDR","6,9:RRR","3,11:RUU","5,11:UU","0,11:UUUU","1,4:UUUR","3,9:LDD","1,0:RRDR","4,0:RDR","7,10:RR","8,0:DDRD","1,12:RRRR","7,1:U","6,10:DRRR","6,12:RRR","9,0:D","0,2:UU"]},{"w":10,"h":13,"a":["4,7:UU","3,6:UURRD","7,4:DDLLD","3,7:DDDRR","4,8:DRRRD","4,3:RRDD","5,8:RRRDD","6,7:RR","2,3:DDD","1,6:DR","3,3:UUUR","1,8:R","9,8:UULU","1,5:UU","0,6:UUUUR","6,10:DRDR","8,4:RUUUU","5,0:DLDR","7,3:RULUU","4,12:RR","4,11:R","6,0:DD","0,0:RRDD","0,12:UUUUU","2,9:DDLD","3,12:U","9,12:UU","8,1:U","0,1:R"]},{"w":10,"h":13,"a":["4,5:LLLLU","4,6:RR","5,4:RDRDD","8,7:UU","4,4:LLLUL","9,6:UUL","8,3:LLLL","5,2:RRRRU","6,7:DDRRR","4,7:R","0,6:RRDRU","9,0:LLDL","0,2:RRRR","5,8:LLLDD","3,0:RR","5,9:LLDDL","3,1:LLLU","9,10:LLLLL","9,12:LLLUL","9,8:LL","0,12:RRRRR","0,11:RUUU","1,7:L","9,11:LL"]},{"w":10,"h":13,"a":["2,4:RRDDD","7,9:ULLU","8,7:LL","4,8:LLDL","5,6:UU","6,5:UULUU","8,10:LLULL","1,3:DDDRR","1,7:LDD","3,9:DD","6,6:RRRD","7,12:LLUUL","4,11:DLLLL","6,0:LLDDD","9,8:DDDD","9,3:DDLL","1,0:RRDD","0,6:UUUU","3,3:LUULL","9,0:LDDLD","0,10:RRD","6,11:RRD","7,0:DL","0,11:R"]},{"w":10,"h":13,"a":["4,7:DLUU","4,6:UUUUL","2,1:DDDDD","5,8:U","5,6:UUUUU","1,6:UULUU","6,8:UU","2,8:DRRRR","2,7:LL","6,5:RDDDD","6,4:UUUUL","8,6:DDD","8,10:LLLL","3,10:LDDL","7,12:LULLL","8,5:RDDDD","9,2:DDLL","0,12:URUU","1,8:L","9,0:DLDDL","1,3:UULU","3,1:U","4,0:D","7,2:U","9,12:ULL"]},{"w":10,"h":13,"a":["4,6:UU","6,6:LUUUL","6,8:LLUR","3,6:UUUUU","6,7:RU","6,5:R","2,6:UUUL","5,9:LLL","8,7:UU","5,2:LUU","1,11:UUURR","6,3:RUU","9,6:UULLL","2,12:RRUUR","0,9:UURRR","1,4:LU","5,0:DRUR","0,5:RD","7,8:RDDDR","8,12:LUUU","8,3:U","5,12:URUU","0,2:RRU","8,0:DRD","3,0:LLL","1,1:L","0,10:DD"]},{"w":10,"h":13,"a":["4,7:UURU","7,5:LDRDD","7,9:LLUU","4,4:UR","3,5:DL","3,2:DDLD","6,4:URDR","3,0:RRDDL","8,5:RUUUU","1,5:D","0,0:RRDRR","9,10:UUULU","5,10:RRRUU","4,10:LUUUL","9,0:LLDDL","0,2:RRD","1,7:LDDD","6,0:D","0,4:R","2,8:DDLDL","0,3:R","9,12:LULLL","0,12:RRRRR","0,1:R"]},{"w":10,"h":13,"a":["5,7:DDDD","6,7:DDDD","6,6:U","4,8:DDDDL","4,7:U","3,7:UUUR","6,4:RDD","7,10:UUUR","5,5:UURR","9,3:DDDD","1,6:RD","3,9:DDLD","9,10:LUUR","3,8:LLLUU","2,9:LDDD","9,2:LDDDD","6,2:LLL","9,12:LLLL","2,5:LLUUU","9,11:LL","7,2:ULLL","3,0:LDDDR","1,4:UUUUL","4,0:RR","0,12:UUU","9,0:DL"]},{"w":10,"h":13,"a":["3,5:DRDR","5,6:RDD","6,9:L","4,8:LDLL","4,9:DRR","3,7:L","9,3:DLLLL","8,10:LUUUR","4,4:DRR","7,6:RRD","7,5:RR","4,0:LDDDD","2,8:LLD","2,1:DDDD","0,7:RUR","4,11:RRDRR","5,0:DDDL","2,10:RDDRR","8,8:RDDD","0,3:DDR","0,12:UUR","6,0:DDD","7,3:URURU","2,11:LD","0,0:DRDDD","7,0:D"]},{"w":10,"h":13,"a":["5,5:D","1,6:RURDR","5,7:LLLLL","4,8:RRUUU","3,8:LLLDD","4,5:UURRR","6,11:UUL","3,4:LL","5,4:RRRRU","8,7:L","4,9:DDDRR","3,9:DDLLL","7,8:DDDDR","3,3:UURRR","9,6:DD","7,6:UR","5,2:RRRRU","9,12:UULUU","0,4:DD","0,3:R","5,0:RRDRU","0,12:RRR","0,0:DRDRD","2,0:D"]},{"w":10,"h":14,"a":["5,6:DD","6,8:DLDDD","3,7:DDD","5,13:LUUUU","4,8:UU","7,7:D","6,6:D","4,5:RRRD","7,9:RUU","3,4:DDLD","4,4:RRRRR","2,9:LLDDD","5,3:RRRUU","0,3:DDDD","6,10:DDDR","2,8:LUUUU","9,6:LU","9,13:LUUU","1,1:DDRRR","1,0:RDDRR","5,2:RRUUR","0,13:RUURR","4,1:RRU","3,13:UL","3,1:U","9,2:UU","0,0:DD"]},{"w":10,"h":14,"a":["4,8:DD","5,5:ULLU","5,7:LLL","7,6:LLLLL","5,8:R","8,8:UUULL","4,5:LL","8,11:UULUU","3,8:DD","1,7:ULU","0,3:URRRR","5,11:UUR","9,4:DDD","4,3:RRRRU","2,8:DDDD","0,8:D","0,0:RRDRR","0,10:RUU","0,4:RRU","3,11:DRR","4,13:RRUUU","9,8:DDDD","5,2:RUURR","5,1:U","9,13:LULUU","7,2:URRU","0,13:RRR","0,12:RU","0,1:R"]},{"w":10,"h":14,"a":["4,3:DDDD","3,7:DR","5,8:DDDLD","3,10:UR","1,4:DDRR","6,5:LDDR","6,8:RRRU","6,6:RRRU","2,7:L","6,9:RR","1,3:LDDDD","3,5:LUUUL","0,12:UUUUR","2,8:DDDRD","9,4:LLLLU","4,0:LDDDD","4,1:RRRRR","0,13:RRRR","6,3:URRDR","6,10:D","7,12:LL","8,13:UULU","9,13:UUUU","1,1:R","5,0:RRRR","1,0:R","0,0:DD"]},{"w":10,"h":14,"a":["2,8:RRR","4,10:RU","8,9:UULLU","6,8:DDD","7,9:U","0,8:URRRR","6,4:LDDL","0,10:URRRR","6,13:RUUU","8,3:LDDL","4,5:LDLU","0,12:URURR","5,3:R","7,6:RUURU","3,13:URRR","0,13:RURUR","1,6:LUUU","4,4:UULL","9,7:U","9,8:DDDD","8,1:RDLLL","9,13:LUUU","1,5:UUULU","2,0:RDRRR","7,1:URR","1,1:UL"]},{"w":10,"h":14,"a":["7,6:ULLL","4,6:LLLLU","4,8:RURUL","3,9:UUR","5,4:LLLLD","4,3:LLLLU","6,3:DRRD","5,3:UR","0,9:UURR","7,12:LUUUU","9,3:DDDL","0,1:RRRDR","7,3:RURU","2,11:URRUR","4,1:URR","7,7:DRR","3,13:URRUU","7,9:RRDDD","2,9:ULDD","8,7:R","7,2:UURR","7,10:RDDDR","0,0:RRR","1,13:UULU","2,13:U","0,13:U"]},{"w":10,"h":14,"a":["5,7:L","6,8:UULLL","3,7:LLLUU","4,4:UL","3,8:RRD","1,6:UUUL","2,6:UUUUU","4,5:LU","4,9:LD","7,8:UUULL","6,9:DDLLL","2,11:UUUL","4,2:L","5,1:DDDR","9,5:DDL","5,13:LLUR","0,8:DDRD","8,6:UUURU","0,0:RRRDR","6,3:RUU","7,11:UURU","5,12:RDR","9,13:UUUUU","1,2:L","6,2:UURRR","8,13:UU","0,1:R","0,12:U","0,13:RUR","8,2:UR"]},{"w":10,"h":14,"a":["0,5:DRRRR","5,1:DDDDD","2,7:RRRRU","1,7:DRRRR","3,5:ULLLU","7,6:DDD","4,4:D","8,10:UUUU","7,5:RRUUU","6,5:U","4,9:RDDRR","9,11:UUUUU","6,0:RDDDD","3,0:DDDR","3,9:L","4,10:DDRRD","8,4:UUUR","4,0:DD","1,11:UULU","3,11:DDLLL","0,12:RRUUR","0,0:DDRR","2,0:D","1,0:D","9,13:LUL","8,0:R"]},{"w":10,"h":14,"a":["5,6:L","2,6:LDLUU","1,4:DRRDD","5,4:LD","4,3:RRDDL","4,8:LLLL","6,7:LL","3,4:LUULL","1,11:UURR","5,8:RRUUU","8,6:UUL","2,11:URRUR","7,2:LLLLD","8,2:ULLLL","9,4:DDDL","3,1:LLUL","1,3:L","3,11:DDLL","8,11:LLL","6,9:RRRDD","4,11:DRRRR","9,0:LLLLL","9,8:L","8,3:L","0,13:UUUU","9,13:LLLLL"]},{"w":10,"h":14,"a":["5,7:LULLL","6,3:DDD","6,7:RU","3,7:LLLUU","5,8:RRR","5,6:UUU","4,8:DDRUR","6,13:UUURU","0,4:RDRRR","2,8:LDDDD","9,7:UULLU","8,10:URU","5,12:U","1,13:RRUUU","3,4:RUUR","7,3:UURRU","4,13:UU","9,11:L","4,1:RRD","8,4:RULUR","8,0:LLL","0,13:UUUU","2,0:DRDDL","8,13:LUU","9,13:UL","1,3:UUUL"]},{"w":10,"h":14,"a":["3,5:R","6,7:RRUU","7,4:DDLLL","5,7:DRD","3,7:R","1,7:DRRR","2,6:D","3,4:ULL","6,5:UURR","3,9:DRRR","1,2:RRRD","2,5:ULLUU","8,1:DLLLD","7,8:DDDDL","1,6:LDDD","8,8:DDDR","0,5:R","4,11:LLLLD","2,9:DLL","9,7:UUUU","4,12:DLLLL","5,11:DDRR","0,1:RR","4,1:LULL","9,0:LLLLL","8,12:D","9,13:U"]},{"w":10,"h":14,"a":["3,8:LL","5,9:UULL","2,7:UUUUU","3,3:DDDR","1,7:UUUUL","5,10:LUU","3,9:DDRR","5,5:DRURR","4,5:URRR","8,11:LLUUU","9,5:DLLDL","4,12:LLUUU","0,8:U","9,11:UUULL","0,10:UR","6,13:ULDL","9,7:L","3,2:UURRR","5,3:L","0,13:UURU","7,3:LUULL","9,13:ULL","2,1:L","1,2:LU","1,13:U","8,4:RUU","7,2:UURR","0,0:RR","8,3:UUR"]},{"w":10,"h":14,"a":["4,4:DRDR","6,8:RUU","6,5:RU","4,7:U","5,4:URRRR","4,10:RUUU","8,6:RDDD","3,6:DDDDL","8,2:LLL","9,5:L","4,2:DLDD","1,10:URUU","6,9:RDDDD","9,4:L","0,5:DRRUU","3,2:URRRR","1,11:RRRRR","8,7:DDDDR","1,4:URULL","1,7:LDDDD","6,12:LLLLL","5,0:LLL","9,2:ULUR","0,0:DRR","1,13:RRRRR","8,12:DR","0,12:D"]}];
  /* Kurallar: her ok, ucunun baktığı yöne doğru (gövdesi arkasından gelerek) kayar.
     Ucun önündeki hücrelerden biri başka bir okla doluysa çarpar: 1 kalp gider. 3 kalp; biterse bölüm baştan.
     Bütün bölümler önceden üretildi ve çözülebilir olduğu doğrulandı (oklar.py / açgözlü çözücü).
     Kayıt: ok_lvl (bölüm), ok_max (açılan en yüksek), ok_stars, ok_best (süre), ok_hint, ok_intro, ok_state (yarım bölüm), ok_gun (bugün kaç yeni bölüm).
     Açılış: pazartesi 08:00'e kadar ilk 20 bölüm açık; sonra kalan 80 bölüm, günde 10 yeni bölüm hakkıyla (eskiler hep tekrar oynanır). */
  var $ = function (id) { return document.getElementById(id); };
  var NS = "http://www.w3.org/2000/svg", S = 100, N = LEVELS.length;
  var DIR = { R: [1, 0], L: [-1, 0], D: [0, 1], U: [0, -1] };
  var board = $("board"), wrap = $("wrap"), stage = $("stage");
  var lvl = 0, maxLvl = 0, stars = [], best = [], hints = 3, L = null, A = [], occ = {}, hearts = 3, mistakes = 0, left = 0;
  var tStart = 0, tBefore = 0, finished = false, hintTimer = null, cell = 30, seq = 0;
  var OPEN_AT = new Date(2026, 9, 19, 8, 0, 0).getTime(), DEMO = 20, DAILY = 10, NCOL = 5;
  function today() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function isDemo() { return Date.now() < OPEN_AT; }
  function doneToday() { var g = lsj("ok_gun"); return g && g.d === today() ? g.n | 0 : 0; }
  function quotaLeft() { return Math.max(0, DAILY - doneToday()); }
  /* oynanabilir mi: bitmiş bölümler hep açık; yenisi için demo/günlük hak kontrolü */
  function canPlay(i) {
    if (i >= DEMO && isDemo()) return false;
    if (stars[i] > 0) return true;
    if (i > maxLvl) return false;
    return i < DEMO || quotaLeft() > 0;
  }
  function untilOpen() {
    var ms = OPEN_AT - Date.now(), h = Math.floor(ms / 3600000), m = Math.ceil((ms % 3600000) / 60000);
    if (m === 60) { h++; m = 0; }
    return h > 0 ? h + " saat" + (m ? " " + m + " dakika" : "") : Math.max(1, m) + " dakika";
  }

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function lsj(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
  (function loadSave() {
    var m = parseInt(ls("ok_max"), 10), l = parseInt(ls("ok_lvl"), 10), h = parseInt(ls("ok_hint"), 10);
    maxLvl = isNaN(m) ? 0 : Math.max(0, Math.min(N - 1, m));
    lvl = isNaN(l) ? 0 : Math.max(0, Math.min(maxLvl, l));
    hints = isNaN(h) ? 3 : Math.max(0, h);
    stars = lsj("ok_stars") || []; best = lsj("ok_best") || [];
  })();
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function key(x, y) { return x + "," + y; }
  /* ses: ok-ses.js varsa çalar, yoksa hiçbir şey yapmaz (kaldırması kolay) */
  function snd(n, o) { if (window.OkSes) try { window.OkSes.play(n, o); } catch (e) {} }
  function setCls(a, st) { a.g.setAttribute("class", "oka c" + a.c + (st ? " " + st : "")); }
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

  function decode(s) {
    var p = s.split(":"), xy = p[0].split(","), x = +xy[0], y = +xy[1], c = [[x, y]], d = [0, 0];
    for (var i = 0; i < p[1].length; i++) { d = DIR[p[1][i]]; x += d[0]; y += d[1]; c.push([x, y]); }
    return { cells: c, dir: d };
  }
  function rayOf(a) {
    var h = a.cells[a.cells.length - 1], x = h[0] + a.dir[0], y = h[1] + a.dir[1], r = [];
    while (x >= 0 && y >= 0 && x < L.w && y < L.h) { r.push([x, y]); x += a.dir[0]; y += a.dir[1]; }
    return r;
  }
  /* önündeki ilk dolu hücre: yoksa -1 */
  function blockAt(a) { var r = rayOf(a); for (var i = 0; i < r.length; i++) { var o = occ[key(r[i][0], r[i][1])]; if (o !== undefined && o !== a.i) return i; } return -1; }
  function isFree(a) { return !a.gone && blockAt(a) < 0; }

  /* ---- çizim ---- */
  function cx(v) { return v * S + S / 2; }
  function at(P, t) {
    var i = Math.floor(t), f = t - i;
    if (i >= P.length - 1) { var a = P[P.length - 2], b = P[P.length - 1], k = t - (P.length - 1); return [b[0] + (b[0] - a[0]) * k, b[1] + (b[1] - a[1]) * k]; }
    if (i < 0) return P[0];
    return [P[i][0] + (P[i + 1][0] - P[i][0]) * f, P[i][1] + (P[i + 1][1] - P[i][1]) * f];
  }
  function shape(a, s) {
    var P = a.path || a.cells, n = a.cells.length, b = s + n - 1, pts = [at(P, s)];
    for (var k = Math.floor(s) + 1; k < b; k++) pts.push(P[k]);
    pts.push(at(P, b));
    var d = "M" + cx(pts[0][0]) + " " + cx(pts[0][1]);
    for (var j = 1; j < pts.length; j++) d += "L" + cx(pts[j][0]) + " " + cx(pts[j][1]);
    a.body.setAttribute("d", d);
    var h = pts[pts.length - 1], hx = cx(h[0]), hy = cx(h[1]), dx = a.dir[0], dy = a.dir[1];
    var tip = [hx + dx * 33, hy + dy * 33], bc = [hx - dx * 6, hy - dy * 6], w = 23;
    a.head.setAttribute("points", tip[0] + "," + tip[1] + " " + (bc[0] - dy * w) + "," + (bc[1] + dx * w) + " " + (bc[0] + dy * w) + "," + (bc[1] - dx * w));
  }
  function render() {
    board.innerHTML = "";
    board.setAttribute("viewBox", (-S * 0.1) + " " + (-S * 0.1) + " " + (L.w * S + S * 0.2) + " " + (L.h * S + S * 0.2));
    var dots = el("g", { "class": "okdots" }, board);
    for (var y = 0; y < L.h; y++) for (var x = 0; x < L.w; x++) el("circle", { cx: cx(x), cy: cx(y), r: 4.5 }, dots);
    var g = el("g", { "class": "okarrows" }, board);
    A.forEach(function (a) {
      a.g = el("g", { "class": "oka c" + a.c }, g);
      a.body = el("path", { "class": "okbody" }, a.g);
      a.head = el("polygon", { "class": "okhead" }, a.g);
      if (a.gone) a.g.style.display = "none"; else shape(a, 0);
    });
  }
  function fit() {
    if (!L) return;
    var vh = (window.visualViewport && window.visualViewport.height) || innerHeight;
    var bs = getComputedStyle(document.body), pt = parseFloat(bs.paddingTop) || 0, pb = parseFloat(bs.paddingBottom) || 0;
    stage.style.height = Math.max(380, vh - pt - pb) + "px";
    var ws = getComputedStyle(wrap), px = (parseFloat(ws.paddingLeft) || 0) + (parseFloat(ws.paddingRight) || 0), py = (parseFloat(ws.paddingTop) || 0) + (parseFloat(ws.paddingBottom) || 0);
    var W = wrap.clientWidth - px, H = wrap.clientHeight - py;
    cell = Math.max(16, Math.min(58, Math.floor(Math.min(W / (L.w + 0.2), H / (L.h + 0.2)))));
    board.style.width = Math.round(cell * (L.w + 0.2)) + "px"; board.style.height = Math.round(cell * (L.h + 0.2)) + "px";
  }

  /* ---- bölüm ---- */
  function load(i, restore) {
    seq++; snd("level"); lvl = i; L = LEVELS[i]; finished = false; occ = {}; hearts = 3; mistakes = 0; tBefore = 0; clearHint();
    A = L.a.map(function (s, j) { var a = decode(s); a.i = j; a.gone = false; a.busy = false; return a; });
    if (restore) {
      var st = lsj("ok_state");
      if (st && st.lvl === i && st.n === A.length) {
        (st.gone || []).forEach(function (j) { if (A[j]) A[j].gone = true; });
        hearts = Math.max(1, Math.min(3, st.h | 0)); mistakes = 3 - hearts; tBefore = +st.t || 0;
      }
    }
    /* renkler: birbirine değen oklar farklı renk alsın (açgözlü boyama) */
    var own = {}; A.forEach(function (a) { a.cells.forEach(function (c) { own[key(c[0], c[1])] = a.i; }); });
    A.forEach(function (a) {
      var used = {};
      a.cells.forEach(function (c) { [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var o = own[key(c[0] + d[0], c[1] + d[1])]; if (o !== undefined && o !== a.i && A[o].c !== undefined) used[A[o].c] = 1; }); });
      var start = (a.i * 2 + i) % NCOL; a.c = start;
      for (var q = 0; q < NCOL; q++) { var cc = (start + q) % NCOL; if (!used[cc]) { a.c = cc; break; } }
    });
    A.forEach(function (a) { if (!a.gone) a.cells.forEach(function (c) { occ[key(c[0], c[1])] = a.i; }); });
    left = A.filter(function (a) { return !a.gone; }).length;
    tStart = Date.now();
    $("lvlNo").textContent = pad(i + 1); $("lvlTot").textContent = "/" + N;
    drawHearts(); $("leftNo").textContent = left; $("hintNo").textContent = hints; msg("");
    ls("ok_lvl", i);
    fit(); render(); save();
    if (left === 0) win();
  }
  function save() {
    try {
      localStorage.setItem("ok_state", JSON.stringify({ lvl: lvl, n: A.length, gone: A.filter(function (a) { return a.gone; }).map(function (a) { return a.i; }), h: hearts, t: elapsed() }));
    } catch (e) {}
  }
  function elapsed() { return tBefore + (finished ? 0 : Date.now() - tStart); }
  function drawHearts() {
    var hs = $("hearts").children;
    for (var i = 0; i < hs.length; i++) hs[i].setAttribute("class", i < hearts ? "on" : "off");
  }
  var msgT = null;
  function msg(t) { var m = $("msg"); m.textContent = t; m.className = "okmsg" + (t ? " show" : ""); clearTimeout(msgT); if (t) msgT = setTimeout(function () { m.className = "okmsg"; }, 1800); }

  /* ---- hareket ---- */
  function anim(dur, step, done) {
    var t0 = 0;
    function f(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / dur); step(p); if (p < 1) requestAnimationFrame(f); else if (done) done(); }
    requestAnimationFrame(f);
  }
  function tap(a) {
    if (!a || a.gone || a.busy || finished || hearts <= 0) return;
    clearHint();
    var b = blockAt(a);
    if (b < 0) slideOut(a); else bump(a, b);
  }
  function slideOut(a) {
    a.gone = true; a.busy = true; left--;
    a.cells.forEach(function (c) { delete occ[key(c[0], c[1])]; });
    var r = rayOf(a), n = a.cells.length, P = a.cells.slice(), h = a.cells[n - 1];
    r.forEach(function (c) { P.push(c); });
    for (var k = 1; k <= n + 2; k++) P.push([h[0] + a.dir[0] * (r.length + k), h[1] + a.dir[1] * (r.length + k)]);
    a.path = P;
    var D = r.length + n + 1, dur = 260 + D * 34;
    setCls(a, "go"); snd("slide", { k: A.length - left - 1 });
    $("leftNo").textContent = left;
    if (navigator.vibrate) try { navigator.vibrate(8); } catch (e) {}
    anim(dur, function (p) {
      var s = D * Math.pow(p, 1.7); shape(a, s);
      var out = s - r.length; a.g.style.opacity = out > 0 ? Math.max(0, 1 - out / (n + 1)) : 1;
    }, function () { a.g.style.display = "none"; a.busy = false; });
    save();
    if (left === 0) { finished = true; tBefore = tBefore + Date.now() - tStart; var my = seq; setTimeout(function () { if (my === seq) cupid(function () { if (my === seq) win(); }); }, Math.min(dur * 0.55, 420)); }
  }
  function bump(a, b) {
    a.busy = true; mistakes++; hearts = Math.max(0, hearts - 1);
    var r = rayOf(a), hit = A[occ[key(r[b][0], r[b][1])]], n = a.cells.length, P = a.cells.slice(), h = a.cells[n - 1];
    for (var k = 1; k <= b + 2; k++) P.push([h[0] + a.dir[0] * k, h[1] + a.dir[1] * k]);
    a.path = P;
    var reach = b + 0.32, dur = 150 + b * 45;
    setCls(a, "bad");
    if (navigator.vibrate) try { navigator.vibrate([20, 40, 20]); } catch (e) {}
    anim(dur, function (p) { shape(a, reach * (1 - Math.pow(1 - p, 2))); }, function () {
      snd("bump");
      if (hit) { setCls(hit, "hit"); setTimeout(function () { if (!hit.gone) setCls(hit, ""); }, 520); }
      wrap.classList.remove("shake"); void wrap.offsetWidth; wrap.classList.add("shake");
      var hs = $("hearts").children[hearts]; if (hs) hs.setAttribute("class", "lost");
      anim(dur * 1.2, function (p) { shape(a, reach * (1 - p * p)); }, function () {
        a.path = null; shape(a, 0); a.busy = false; setCls(a, "");
        drawHearts(); save();
        if (hearts <= 0) setTimeout(fail, 250); else msg(hearts === 1 ? "Son kalp." : "Önü kapalı.");
      });
    });
  }

  /* ---- Eros'un oku: tahta boşalınca ortada bir kalp belirir, altın bir ok gelip tam ortasına saplanır ---- */
  var HEART = "M12 20.5s-7.5-4.6-7.5-10.6a4.3 4.3 0 0 1 7.5-2.9 4.3 4.3 0 0 1 7.5 2.9c0 6-7.5 10.6-7.5 10.6z";
  function cupid(done) {
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var bw = L.w * S, bh = L.h * S, m = Math.min(bw, bh), cxp = bw / 2, cyp = bh / 2 + m * 0.02;
    var hs = m * 0.36 / 15, layer = el("g", { "class": "okcupid" }, board);
    var defs = el("defs", {}, layer), rg = el("radialGradient", { id: "okglow" }, defs);
    el("stop", { offset: "0", "stop-color": "#ff8597", "stop-opacity": ".55" }, rg); el("stop", { offset: "1", "stop-color": "#ff8597", "stop-opacity": "0" }, rg);
    var glow = el("circle", { cx: cxp, cy: cyp, r: m * 0.42, fill: "url(#okglow)", opacity: 0 }, layer);
    var ring = el("circle", { cx: cxp, cy: cyp, r: m * 0.2, fill: "none", stroke: "#ff8597", "stroke-width": 6, opacity: 0 }, layer);
    /* ok: altın gövde, beyaz uç, pembe-lila tüyler; uç (0,0)'da, gövde -x yönünde */
    var ang = -32, len = m * 0.62, arrow = el("g", { opacity: 0 }, layer), ag = el("g", {}, arrow);
    el("path", { d: "M" + (-len) + " 0H-14", stroke: "#f5d17f", "stroke-width": m * 0.022, "stroke-linecap": "round" }, ag);
    el("path", { d: "M2 0L-" + m * 0.075 + " -" + m * 0.04 + "L-" + m * 0.055 + " 0L-" + m * 0.075 + " " + m * 0.04 + "z", fill: "#ffffff" }, ag);
    var fl = m * 0.11, fx = -len + m * 0.02;
    el("path", { d: "M" + fx + " 0l" + fl * 0.5 + " " + -fl * 0.45 + "h" + fl * 0.75 + "l" + -fl * 0.5 + " " + fl * 0.45 + "z", fill: "#ff9db0" }, ag);
    el("path", { d: "M" + fx + " 0l" + fl * 0.5 + " " + fl * 0.45 + "h" + fl * 0.75 + "l" + -fl * 0.5 + " " + -fl * 0.45 + "z", fill: "#d4a8f5" }, ag);
    var heart = el("g", {}, layer), hp = el("path", { d: HEART, fill: "#ff8597", "fill-opacity": ".22", stroke: "#ff8597", "stroke-width": 1.3, "stroke-linejoin": "round" }, heart);
    var shine = el("path", { d: "M7.6 9.2a2.6 2.6 0 0 1 2.6-2.2", fill: "none", stroke: "#fff", "stroke-width": 1.1, "stroke-linecap": "round", opacity: 0 }, heart);
    var parts = [];
    function setHeart(sx, sy) { heart.setAttribute("transform", "translate(" + cxp + " " + cyp + ") scale(" + (hs * sx) + " " + (hs * sy) + ") translate(-12 -12.6)"); }
    function setArrow(dist, rot) {
      var rad = ang * Math.PI / 180, tx = cxp - Math.cos(rad) * dist, ty = cyp - Math.sin(rad) * dist;
      arrow.setAttribute("transform", "translate(" + tx + " " + ty + ") rotate(" + (ang + rot) + ")");
    }
    function burstParts() {
      for (var i = 0; i < 12; i++) {
        var a = (i / 12) * Math.PI * 2 + Math.random() * 0.4, small = i % 3 === 2;
        var g = el("g", {}, layer), p = small ? el("circle", { r: 9, fill: "#ffd27a" }, g) : el("path", { d: HEART, fill: i % 2 ? "#ff8597" : "#ffb3c0" }, g);
        parts.push({ g: g, a: a, d: m * (0.3 + Math.random() * 0.22), s: small ? 1 : (0.18 + Math.random() * 0.12) * m / 100, heart: !small, rot: (Math.random() - 0.5) * 50 });
      }
    }
    if (reduce) { snd("hit"); setHeart(1, 1); hp.setAttribute("fill-opacity", "1"); setArrow(0, 0); arrow.setAttribute("opacity", 1); setTimeout(done, 700); return; }
    setHeart(0.001, 0.001); setArrow(m * 1.3, 0);
    var t0 = 0, T_IN = 420, T_FLY = 430, T_HIT = T_IN + T_FLY, T_END = T_HIT + 1500, impactDone = false;
    function ease(t) { return 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2); }   /* easeOutBack */
    var mySeq = seq;
    function frame(ts) {
      if (mySeq !== seq) return;
      if (!t0) t0 = ts; var t = ts - t0;
      /* 1) kalp belirir */
      var pin = Math.min(1, t / T_IN), sc = ease(pin);
      glow.setAttribute("opacity", Math.min(1, pin * 1.3) * 0.9);
      /* 2) ok uçar (hızlanarak), ucu kalbin ortasında durur */
      if (t > T_IN - 120) {
        var pf = Math.min(1, (t - (T_IN - 120)) / T_FLY);
        arrow.setAttribute("opacity", Math.min(1, pf * 4));
        setArrow(m * 1.3 * (1 - pf * pf * pf), 0);
      }
      /* 3) çarpma: kalp esner, dolar, halka ve küçük kalpler saçılır, ok titrer */
      var sx = sc, sy = sc;
      if (t >= T_HIT) {
        if (!impactDone) { impactDone = true; snd("hit"); hp.setAttribute("fill-opacity", "1"); shine.setAttribute("opacity", ".7"); burstParts(); if (navigator.vibrate) try { navigator.vibrate(25); } catch (e) {} }
        var ti = (t - T_HIT) / 1000, sq = Math.exp(-ti * 7) * Math.sin(ti * 32) * 0.16;
        sx = 1 + sq; sy = 1 - sq;
        var beat = ti > 0.55 ? Math.max(0, Math.sin((ti - 0.55) * Math.PI / 0.22)) * (ti < 0.77 ? 0.09 : 0) + Math.max(0, Math.sin((ti - 0.85) * Math.PI / 0.22)) * (ti > 0.85 && ti < 1.07 ? 0.07 : 0) : 0;
        sx += beat; sy += beat;
        setArrow(0, Math.exp(-ti * 6) * Math.sin(ti * 46) * 5);
        var pr = Math.min(1, ti / 0.6);
        ring.setAttribute("r", m * (0.2 + pr * 0.32)); ring.setAttribute("opacity", (1 - pr) * 0.8); ring.setAttribute("stroke-width", 6 * (1 - pr) + 1);
        parts.forEach(function (q) {
          var pp = Math.min(1, ti / 0.95), d = q.d * (1 - Math.pow(1 - pp, 3)), x = cxp + Math.cos(q.a) * d, y = cyp + Math.sin(q.a) * d - pp * m * 0.05;
          q.g.setAttribute("transform", "translate(" + x + " " + y + ")" + (q.heart ? " rotate(" + q.rot + ") scale(" + q.s + ") translate(-12 -12.6)" : ""));
          q.g.setAttribute("opacity", pp < 0.6 ? 1 : (1 - pp) / 0.4);
        });
      }
      setHeart(sx, sy);
      if (t < T_END) requestAnimationFrame(frame); else done();
    }
    requestAnimationFrame(frame);
  }

  /* ---- ipucu ---- */
  function clearHint() { clearTimeout(hintTimer); A.forEach(function (a) { if (a.g && !a.gone && / tip$/.test(a.g.getAttribute("class"))) setCls(a, ""); }); }
  function hint() {
    if (finished) return;
    if (hints <= 0) { msg("İpucu kalmadı. Her 5 bölümde 1 tane gelir."); return; }
    var free = A.filter(isFree); if (!free.length) return;
    clearHint();
    var a = free[Math.floor(Math.random() * free.length)];
    hints--; ls("ok_hint", hints); $("hintNo").textContent = hints;
    setCls(a, "tip"); snd("hint");
    hintTimer = setTimeout(clearHint, 2600);
  }

  /* ---- sonuç ---- */
  var DONE3 = ["Temiz.", "Hatasız.", "Kusursuz.", "Tek dokunuş boşa gitmedi.", "Kolaydı galiba."];
  var DONE2 = ["Bir kalp eksik.", "Az kalsın kusursuz.", "Fena değil."];
  var DONE1 = ["Kıl payı.", "Son kalple.", "Zor da olsa bitti."];
  var MILE = { 10: "On bölüm. Isınma bitti.", 25: "25. Tahtalar büyüyor.", 50: "Yarı yol.", 75: "75. Bu tahtalar sana yetmiyor galiba.", 100: "100/100. Eros bile bu kadar isabetli değil." };
  function fmt(ms) { var s = Math.round(ms / 1000), m = Math.floor(s / 60); return m + ":" + pad(s % 60); }
  function starSvg(on) { return '<svg viewBox="0 0 24 24" class="' + (on ? "on" : "") + '"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/></svg>'; }
  function win() {
    if (!$("done").hidden && $("doneNext").dataset.mode !== "fail") return;
    finished = true;
    var st = Math.max(1, hearts), t = tBefore, first = !(stars[lvl] > 0), isNewBest = !(best[lvl] > 0) || t < best[lvl];
    stars[lvl] = Math.max(stars[lvl] || 0, st); if (isNewBest) best[lvl] = t;
    if (first && (lvl + 1) % 5 === 0) { hints++; ls("ok_hint", hints); }
    if (first && lvl >= DEMO) ls("ok_gun", JSON.stringify({ d: today(), n: doneToday() + 1 }));
    if (lvl + 1 > maxLvl) maxLvl = Math.min(N - 1, lvl + 1);
    ls("ok_stars", JSON.stringify(stars)); ls("ok_best", JSON.stringify(best)); ls("ok_max", maxLvl);
    try { localStorage.removeItem("ok_state"); } catch (e) {}
    if (lvl + 1 < N) ls("ok_lvl", lvl + 1);
    var pool = st === 3 ? DONE3 : st === 2 ? DONE2 : DONE1;
    $("doneKick").textContent = "Bölüm " + pad(lvl + 1);
    $("doneTitle").textContent = MILE[lvl + 1] || pool[lvl % pool.length];
    $("doneStars").innerHTML = starSvg(st >= 1) + starSvg(st >= 2) + starSvg(st >= 3);
    $("doneStats").innerHTML = "<span><small>Süre</small><b>" + fmt(t) + "</b></span><span><small>En iyi</small><b>" + fmt(best[lvl]) + "</b></span>" + (first && (lvl + 1) % 5 === 0 ? "<span><small>İpucu</small><b>+1</b></span>" : "");
    var last = lvl >= N - 1, nextOk = !last && canPlay(lvl + 1);
    $("doneText").textContent = "";
    if (!last && !nextOk) {
      $("doneTitle").textContent = isDemo() ? "Şimdilik bu kadar." : "Bugünlük bu kadar.";
      if (isDemo()) $("doneText").textContent = "Canın sıkıldığı için " + DEMO + " bölüm açtık. Kalan " + (N - DEMO) + " bölüm pazartesi sabahı açılıyor (" + untilOpen() + " kaldı). Puzzle canavarına 100 bölümü bir anda vermek riskli bulundu :D";
      else $("doneText").textContent = "Bugünkü " + DAILY + " bölüm hakkın doldu. Bölümler bir günde bitmesin diye yönetim kontrole aldı :D Yarın " + DAILY + " bölüm daha.";
    } else if (!last && lvl >= DEMO && quotaLeft() <= 3) $("doneText").textContent = "Bugün " + quotaLeft() + " yeni bölüm hakkın kaldı.";
    $("doneNext").textContent = last || !nextOk ? "Bölümler" : "Sonraki"; $("doneNext").dataset.mode = nextOk ? "win" : "end";
    $("doneAgain").textContent = "Tekrar";
    $("done").hidden = false;
  }
  function fail() {
    finished = true; snd("fail");
    try { localStorage.removeItem("ok_state"); } catch (e) {}
    $("doneKick").textContent = "Bölüm " + pad(lvl + 1);
    $("doneTitle").textContent = "Kalpler bitti."; $("doneText").textContent = "Önce ucunun önü boş olanları bul, sonra arkadakiler açılır.";
    $("doneStars").innerHTML = "";
    $("doneStats").innerHTML = "";
    $("doneNext").textContent = "Tekrar dene"; $("doneNext").dataset.mode = "fail";
    $("doneAgain").textContent = "Bölümler";
    $("done").hidden = false;
  }
  $("doneNext").onclick = function () {
    var mode = this.dataset.mode; $("done").hidden = true;
    if (mode === "fail") load(lvl, false);
    else if (mode === "end" || lvl >= N - 1) openLevels();
    else load(lvl + 1, false);
  };
  $("doneAgain").onclick = function () {
    var mode = $("doneNext").dataset.mode; $("done").hidden = true;
    if (mode === "fail") openLevels(); else load(lvl, false);
  };

  /* ---- bölüm seçici ---- */
  function openLevels() {
    var g = $("lvlGrid"); g.innerHTML = "";
    for (var i = 0; i < N; i++) {
      var b = document.createElement("button"); b.type = "button";
      var s = stars[i] || 0, open = canPlay(i);
      b.className = (i === lvl ? "cur " : "") + (s ? "done " : "") + (open ? "" : "kilit");
      var dots = ""; for (var q = 0; q < 3; q++) dots += q < s ? "<u class=\"on\"></u>" : "<u></u>";
      b.innerHTML = "<b>" + pad(i + 1) + "</b><i>" + (s ? dots : "") + "</i>";
      b.disabled = !open; b.dataset.i = i;
      b.onclick = function () { $("lvlOv").hidden = true; $("done").hidden = true; load(+this.dataset.i, false); };
      g.appendChild(b);
    }
    $("lvlNote").textContent = isDemo() ? "Şimdilik ilk " + DEMO + " bölüm açık. Kalan " + (N - DEMO) + " bölüm pazartesi 08:00'de açılıyor (" + untilOpen() + " kaldı)." : quotaLeft() > 0 ? "Bugün " + quotaLeft() + " yeni bölüm hakkın var. Bitirdiklerini istediğin kadar tekrar oynayabilirsin." : "Bugünkü " + DAILY + " bölüm hakkın doldu, yarın yenilenir. Bitirdiklerini tekrar oynayabilirsin.";
    $("lvlOv").hidden = false;
    var cur = g.children[lvl]; if (cur && cur.scrollIntoView) try { cur.scrollIntoView({ block: "center" }); } catch (e) {}
  }
  $("lvlBtn").onclick = openLevels; $("bLevels").onclick = openLevels;
  $("lvlClose").onclick = function () { $("lvlOv").hidden = true; };
  $("bRestart").onclick = function () { if (A.some(function (a) { return a.busy; })) return; load(lvl, false); };
  $("bHint").onclick = hint;

  /* ---- dokunma: en yakın okun hücresi (boşluğa denk gelirse yarım hücre tolerans) ---- */
  function pick(ev) {
    var r = board.getBoundingClientRect(), u = r.width / (L.w + 0.2);
    var fx = (ev.clientX - r.left) / u - 0.1, fy = (ev.clientY - r.top) / u - 0.1, x = Math.floor(fx), y = Math.floor(fy);
    var o = occ[key(x, y)]; if (o !== undefined) return A[o];
    var bestA = null, bd = 0.62;
    for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
      var j = occ[key(x + dx, y + dy)]; if (j === undefined) continue;
      var d = Math.max(Math.abs(fx - (x + dx + 0.5)), Math.abs(fy - (y + dy + 0.5))) - 0.5;
      if (d < bd) { bd = d; bestA = A[j]; }
    }
    return bestA;
  }
  board.addEventListener("pointerdown", function (ev) { if (ev.button > 0) return; ev.preventDefault(); tap(pick(ev)); });

  function refit() { fit(); }
  addEventListener("resize", refit); addEventListener("orientationchange", function () { setTimeout(refit, 250); });
  if (window.visualViewport) window.visualViewport.addEventListener("resize", refit);
  addEventListener("pageshow", function () { setTimeout(refit, 60); });
  addEventListener("pagehide", save);
  document.addEventListener("visibilitychange", function () { if (document.hidden) save(); });

  function locked() {
    $("doneKick").textContent = "Bölüm " + pad(Math.min(N, lvl + 2));
    $("doneTitle").textContent = isDemo() ? "Şimdilik bu kadar." : "Bugünlük bu kadar.";
    $("doneStars").innerHTML = ""; $("doneStats").innerHTML = "";
    $("doneText").textContent = isDemo() ? "Canın sıkıldığı için " + DEMO + " bölüm açtık. Kalan " + (N - DEMO) + " bölüm pazartesi sabahı açılıyor, " + untilOpen() + " kaldı. Puzzle canavarına 100 bölümü bir anda vermek riskli bulundu :D" : "Bugünkü " + DAILY + " bölüm hakkın doldu. Bölümler bir günde bitmesin diye yönetim kontrole aldı :D Yarın " + DAILY + " bölüm daha.";
    $("doneNext").textContent = "Bölümler"; $("doneNext").dataset.mode = "end"; $("doneAgain").textContent = "Son bölümü tekrar oyna";
    $("done").hidden = false;
  }
  /* bitmiş bir bölümde kalınmışsa (ör. kilitliyken açılıp kapandıysa) ve sıradaki ilk oynanmamış bölüm artık açıksa, doğrudan ona geç (yarım bırakılmış tekrar oyunu varsa dokunma) */
  (function () { var st = lsj("ok_state"); if (stars[lvl] > 0 && lvl + 1 < N && lvl + 1 === maxLvl && canPlay(lvl + 1) && !(st && st.lvl === lvl && st.gone && st.gone.length)) lvl = lvl + 1; })();
  var startLvl = lvl, wasLocked = !canPlay(lvl) || (stars[lvl] > 0 && lvl + 1 < N && !canPlay(lvl + 1) && maxLvl > lvl);
  while (startLvl > 0 && !canPlay(startLvl)) startLvl--;
  if (ls("ok_intro") !== "1") {
    $("intro").hidden = false; load(startLvl, !wasLocked);
    $("introGo").onclick = function () { $("intro").hidden = true; ls("ok_intro", "1"); tStart = Date.now(); };
  } else {
    load(startLvl, !wasLocked);
    if (wasLocked) locked();
    else if (!isDemo() && maxLvl >= DEMO && doneToday() === 0) setTimeout(function () { msg("Bugün " + DAILY + " yeni bölüm hakkın var."); }, 400);
  }

  if (location.hash === "#test") window.__ok = { canPlay: canPlay, load: load, tapIdx: function (i) { tap(A[i]); }, state: function () { return { demo: isDemo(), quota: quotaLeft(), canNext: canPlay(lvl + 1), lvl: lvl, hearts: hearts, left: left, finished: finished, free: A.filter(isFree).map(function (a) { return a.i; }), n: A.length, maxLvl: maxLvl, stars: stars, hints: hints, cell: cell }; } };
})();
