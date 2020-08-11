//SERVER//SERVER//SERVER//

//server variables
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = 7799;

//sends client to connected clients
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/client.html');
});

//socket channels
io.on('connection', function (socket) {
	const ID = socket.id;
	console.log('Connect--- [' + ID + ']');

	socket.on('!', function log(data) {
		console.log(data);
	});

	socket.on('disconnect', function () {
		console.log('Disconnect [' + ID + ']');
	});

	socket.on('reqGame', function (data) {
		console.log('reqGame--- [' + ID + ']');
		io.emit('recGame', GameManager.Q(data));
	});

	socket.on('reqRoll', function (data) {
		console.log('reqRoll--- [' + ID + ']');

		io.emit('recRoll', GameManager.GetDice());
	});

	socket.on('reqBoard', function (data) {
		console.log('reqBoard-- [' + ID + ']');
		io.emit('recBoard', GameManager.GetBoards(data));
	});

	socket.on('reqTile', function (data) {
		console.log('reqTile--- [' + ID + ']');
		GameManager.Boards[data[0]].Tiles[data[1]][data[2]].Complete = !GameManager.Boards[data[0]].Tiles[data[1]][data[2]].Complete;
		io.emit('recTile', data + " (" + GameManager.Boards[data[0]].Tiles[data[1]][data[2]].Icon + "): " + GameManager.Boards[data[0]].Tiles[data[1]][data[2]].Complete);
	});

	socket.on('reqTime', function (data) {
		console.log('reqTime--- [' + ID + ']');
		io.emit('recTime', (parseInt(data[0]) + parseInt(data[1])));
	});

	
});

http.listen(port, '0.0.0.0', function () {
	console.log('listening on *:' + port);
	
});

//GAME//GAME//GAME//

//Object with tile functions
var Tile =
{
	//returns new tile instance
	Q: function (setIcon) {
		var newTile = Object.create(this);
		newTile.Icon = setIcon;

		return newTile;
	},

	Icon: '-',
	Complete: false
};

//Object with board functions
var Board =
{
	//returns new board instance
	Q: function () {
		var newBoard = Object.create(this);
		newBoard.Tiles = [
			[Tile.Q('A'), Tile.Q('B'), Tile.Q('C'), Tile.Q('D'), Tile.Q('E')],
			[Tile.Q('F'), Tile.Q('G'), Tile.Q('H'), Tile.Q('I'), Tile.Q('J')],
			[Tile.Q('K'), Tile.Q('L'), Tile.Q('M'), Tile.Q('N'), Tile.Q('O')],
			[Tile.Q('P'), Tile.Q('Q'), Tile.Q('R'), Tile.Q('S'), Tile.Q('T')],
			[Tile.Q('U'), Tile.Q('V/W'), Tile.Q('X/Y'), Tile.Q('Z/&#xC5'), Tile.Q('&#xC4/&#xD6')]
		];

		newBoard.Render = function () {
			var htmlOut = "";

			for (var y = 0; y < 5; y++) {
				htmlOut +=
					"<tr id='y" + y + "'>";
				for (var x = 0; x < 5; x++) {

					var tileStatus = "";
					if (this.Tiles[y][x].Complete) {
						tileStatus = " tilecomplete";
					}

					htmlOut +=
						"<td><input type='button' id='x" + x + "' class='tile" + tileStatus + "' onclick='req.Tile([parseInt(document.getElementById(\"displayName\").innerHTML -1)," + y + "," + x + "])' value='" + this.Tiles[y][x].Icon + "'/></td>";

				}

				htmlOut += "</tr>";
			}

			return htmlOut;
		};

		return newBoard;
	},

	Tiles: [],

	//returns the board as html (used by clients)
	Render: function () {}
};

//Object with functions for pregame setup board
var BoardSetup = {
	//returns new setup board instance
	Q: function () {
		var newBoardSetup = Object.create(this);

		return newBoardSetup;
	},

	//returns the setup board as html (used by cluents)
	Render: function () {
		var htmlOut = "<tr><th style='font-size:233%; color:white;'>Amount of Players</th ></tr ><tr><td><input id='req.GameBN' type='number' class='dice' style='text-align:center' /><button class='dice' style='background-color:green' onclick='req.Game(document.getElementById(\"req.GameBN\").value)'> &check; </button></td></tr>";

		return htmlOut;
	}
};

//Object with die functions
var Die =
{
	//returns new die instance
	Q: function (setValues) {
		var newDie = Object.create(this);
		newDie.Values = setValues;

		return newDie;
	},

	Values: [],

	//retuns a random value of the dies assign values 
	Roll: function () {
		return this.Values[Math.floor(this.Values.length * Math.random())];
	}
};

//Objetct with game functions
var GameManager =
{
	//retuns the number of boards, start a new game
	Q: function (numberBoards) {
		this.Boards = [];
		for (var iboards = 0; iboards < numberBoards; iboards++) {
			this.Boards.push(Board.Q());
		}

		return this.Boards.length;
	},

	Cards: ['Spel man beh&#xF6;ver ett n&#xE4;t till', 'Hush&#xE5;llssaker', 'Svenska dagstidningar', 'Basketbollag', 'Soppor', 'K&#xE4;nda skid&#xE5;kare / skid&#xE5;kerskor', 'M&#xE4;rken p&#xE5; d&#xE4;ck', 'Finns hos tandl&#xE4;karen', 'Hattar', 'P&#xE5; pizzan', 'Transportmedel', 'B&#xF6;rsnoterade f&#xF6;retag', 'Finns i ett kylsk&#xE5;p', 'K&#xE4;nda varum&#xE4;rken', 'Mat / dryck inneh&#xE5;lande &#xE4;gg', 'Presenter', 'Kan flyga', 'I s&#xE4;ngen', 'Kroppsdelar', 'Olympijska sommarsporter', 'Hittas i bilens bagagelucka', 'Utl&#xE4;ndska sj&#xF6;ar', 'Svenska Kvinnliga sk&#xE5;despelare(efternamn)', 'Utl&#xE4;ndska efternamn', 'Saker du kan skriva med', 'Saker p&#xE5; ett fartyg / skepp', 'Planeter', 'Baktillbeh&#xF6;r', 'Ord som rimmar p&#xE5; "natt"', 'Beatles - s&#xE5;nger', 'Sportgrenar d&#xE4;r man anv&#xE4;nder boll', 'Saker i badrummet', 'Konstn&#xE4;rer(efternamn)', '&#xC4;delstenar', 'P&#xE5; julbordet', 'Saker som &#xE4;r naturligt bl&#xE5;', 'Att ta med sig p&#xE5; picnic', 'Sommarsemesterorter', 'Superhj&#xE4;ltar', 'S&#xE4;tt att koppla av p&#xE5;', 'Utl&#xE4;ndska kvinliga sk&#xE5;despelare(efternamn)', 'Saker man kan m&#xE4;ta', 'Barnspel', 'Utl&#xE4;ndska &#xF6;ar', 'Europeiska utl&#xE4;ndska fotbollslag', 'Former', 'Kan du ta med dig till stranden', 'Livsmedel', 'Valutor', 'Verktyg', 'Olika sorters matbr&#xF6;d', 'Slott', 'Finns i sovrummet', 'Byggnader', 'Platser d&#xE4;r man kan &#xE4;ta', 'Saker med hjul', 'Utomhussporter', 'Bilm&#xE4;rken(ej europeiska)', 'Kontorsmaterial', 'Saker att g&#xF6;ra regninga dagar', 'N&#xF6;tter', 'Barnlekar', 'L&#xE4;nder s&#xF6;der om ekvatorn', 'Lever i tr&#xE4;d', 'Gaser', 'Djur med horn', 'Ord som inneh&#xE5;ller "y"', 'Tilltugg', 'Saker som &#xE4;r naturligt gula', 'P&#xE5; himlen', 'R&#xE5;material', 'Filmer', 'F&#xE4;rger', 'Finns inne i bilen', 'Lik&#xF6;rer', 'Mat fr&#xE5;n havet', 'Ber&#xF6;mda uppfinnare', 'Sm&#xF6;rg&#xE5;sp&#xE5;l&#xE4;gg', 'Kan man l&#xE4;sa', 'Floder i Sverige', 'V&#xE4;xter', 'Drottningar', 'Bibliska personer', 'Djur som bor i h&#xE5;lor / gryt', 'I stallet', 'Disney - figurer', 'St&#xE4;der i England', 'Till p&#xE5;sk', 'Golvmaterial', 'Musik - sorter', 'S&#xE5;dant som kan sm&#xE4;lta', 'Bl&#xE5;sinstrument', 'S&#xE5;dant som f&#xE5;r dig att skratta', 'M&#xE5;ttenheter', 'L&#xE4;nder utan kust', 'Sl&#xE4;ktskap', 'Byggmaterial', 'Gr&#xF6;nsaker', 'Saker som &#xE4;r naturligt gr&#xF6;na', 'Saker du hittar i k&#xF6;ket', 'Saker du hittar i barnkammaren', 'Detektiver', 'Elvis Presley - l&#xE5;tar', 'Ministerposter', 'Komiker', 'Saker som kan frysas', 'Tillf&#xE4;llen d&#xE5; man ger bort blommor', 'Veckotidningar', 'Slangutryck', 'F&#xF6;rnamn som inneh&#xE5;ller "V"', 'Bondg&#xE5;rdsdjur', 'Finns i skogen', 'Campingutrustning', 'Parfymm&#xE4;rken', 'Seriefigurer', 'Insekter', 'Olika s&#xE4;tt att tillaga mat', 'Ord som slutar p&#xE5; "era"', 'F&#xF6;rnamn som slutar p&#xE5; "s"', 'Saker som &#xE4;r naturligt r&#xF6;da', 'Komposit&#xF6;rer(efternamn)', 'Saker att ha p&#xE5; huvudet / i h&#xE5;ret', 'Matr&#xE4;tter', 'Kryddor', 'Saker som &#xE4;r naturligt vita', 'Musiktermer', 'Elektriska hush&#xE5;llsapparater', 'Yrken', 'Namn p&#xE5; k&#xE4;nda skepp / fartyg', 'Svenska fotbollslag', 'P&#xE5; tivoli', 'Kan ha p&#xE5; f&#xF6;tterna', 'L&#xE4;nder som slutar p&#xE5; "-land"', 'Namn p&#xE5; l&#xE4;skedrycker', 'Kan k&#xF6;pas i en bokhandel', 'K&#xE4;nda skid&#xE5;kningsorter', 'Motorcykelm&#xE4;rken', 'Personliga egenskaper', 'Huvudst&#xE4;der', 'Fiskar', 'Kan k&#xF6;pas i en j&#xE4;rnaff&#xE4;r', 'Drivmedel', 'Kan &#xF6;ppnas och st&#xE4;ngas igen', 'Banker', 'Vattensporter', 'Hobbyer', 'Svenska rock / popgrupper', 'Skol&#xE4;mnen', 'Textilier', 'B&#xF6;ckerna i Bibeln', 'Saker gjorda av tr&#xE4;', 'M&#xE5;largrejor', 'I pl&#xE5;nboken', 'Grund&#xE4;mnen', 'Romantiska saker', 'Inomhussporter', 'Datatermer', 'Saker i medicinsk&#xE5;pet', 'I eller vid f&#xF6;nstret', 'Saker som kan vara r&#xF6;kta', 'Finns i tr&#xE4;dg&#xE5;rden', 'Svenska s&#xE5;ngerskor(efetrnamn)', 'Cykeldelar', 'D&#xE4;ggdjur', 'Kl&#xE4;dersplagg', 'Bildelar', 'Saker som finns p&#xE5; / vid v&#xE4;gen', 'Milit&#xE4;ra fordon', 'Smakar surt', 'Saker p&#xE5; golvet', 'I simhallen', 'M&#xE4;rken p&#xE5; kl&#xE4;der', 'Utl&#xE4;ndska floder', 'K&#xE4;nda svenska fotbollsspelare(efternamn)', 'Stj&#xE4;rntecken', 'S&#xE4;llskapsspel', 'St&#xE4;der i Europa', 'Musikaler', 'L&#xE4;nder i Afrika', 'Visar tiden', 'Saker som du kan kl&#xE4;mma ihop', 'Italiensk mat', 'Babyartiklar', 'P&#xE5; taket', 'Radio / TV - m&#xE4;rken', 'Kinesisk mat', 'Landskapsnamn', 'Saker som sticks', 'Kan k&#xF6;pas p&#xE5; apotek', 'Saker gjorda av metall', 'Saker i en damhandv&#xE4;ska', 'K&#xE4;nda idrottare(efternamn)', 'Mat / dryck inneh&#xE5;lande mj&#xF6;lk', 'Tr&#xE4;d', 'I mj&#xF6;lkdisken', 'Nordiska st&#xE4;der(ej svenska)', 'S&#xE4;llskapspelsm&#xE4;rken', 'Saker i garaget', 'Finns hos doktorn', 'Hav', 'Museum', 'P&#xE5; v&#xE4;ggen', 'Engelska fotbollslag', 'S&#xE4;tt att f&#xF6;rflytta sig p&#xE5;', 'Smaker p&#xE5; glass', 'Flygbolag', 'Olympiska vintersporter', 'Berg / alptoppar', 'Kan du se p&#xE5; Zoo', 'Saker som &#xE4;r naturligt svarta', 'Utl&#xE4;ndska manliga s&#xE5;ngare(efternamn)', 'Frukter', '&#xD6;lm&#xE4;rken', 'D&#xE4;r du kan kl&#xE4;ttra upp eller ned', 'Milit&#xE4;ra grader', 'Europeiska bilm&#xE4;rken', 'V&#xE4;xer p&#xE5; tr&#xE4;d', 'Fototillbeh&#xF6;r', 'Naturligt kalla saker', 'Ord som slutar p&#xE5; "-tion"', 'L&#xE4;nder norr om ekvatorn', 'Svenska f&#xF6;rfattare(efternamn)', 'TV - program f&#xF6;r barn', 'St&#xE4;der i Sverige', 'Manliga svenska s&#xE5;ngare(efternamn)', 'Saker som avger oljud', 'Vad man kan fira', 'Snabbmat', 'P&#xE5; sj&#xF6;n / havet', 'Saker att samla p&#xE5;', 'Konserver', 'Ord som inneh&#xE5;ller "x"', 'Saker gjorda av ull', 'B&#xE4;r', 'S&#xE5;ngtitlar', 'Tr&#xE4;dg&#xE5;rdsblommor', 'I k&#xF6;ttdisken', 'S&#xE4;desslag', 'Smakar s&#xF6;tt', 'Sagofigurer', 'Vassa saker', 'TV - program', 'Varma drycker', 'Utl&#xE4;ndska pop / rockgrupper', 'Flicknamn som slutar p&#xE5; "a"', 'Saker som flyter', '"S&#xE5;por" p&#xE5; TV', 'Kungar', 'Vad g&#xF6;r dig arg', 'Kortspel', 'Sportartiklar', 'S&#xE5;dant som avger r&#xF6;k', 'Svampar', 'I tv&#xE4;ttstugan', 'Religioner', 'St&#xE4;der vid havet', 'L&#xE4;nder i Asien', 'Presidenter / statschefer', '&#xD6;ar i Sverige', 'Ord som rimmar p&#xE5; "n&#xF6;t"', 'Gatunamn', 'Grekisk / spansk mat', 'Utrustad med ben', 'Beh&#xE5;llare / k&#xE4;rl', 'Flygplanstyper', 'Barnsjukdomar', 'Finns i lekparken', 'H&#xE5;rdrocksgrupper', 'Kalla drycker', 'Namn p&#xE5; aff&#xE4;rer / varuhus / stormarknader', 'Skom&#xE4;rken', 'Broar', 'Kan du se i biosalongen', 'Kan k&#xF6;pas p&#xE5; konditoriet', 'Prickiga / fl&#xE4;ckiga / randiga djur', 'Sytillbeh&#xF6;r', 'Ishockeylag', 'Sydamerikanska l&#xE4;nder', 'Kaffebr&#xF6;d', 'Korvsorter', 'P&#xE5; frukostbordet', 'Utl&#xE4;ndska fotbollsspelare(efetrnamn)', 'Disk - och tv&#xE4;ttmedelsm&#xE4;rken', 'Utl&#xE4;ndska manliga sk&#xE5;despelare(efternamn)', 'Saker gjorda av plast', 'Danser', 'Saker i en skrivbordsl&#xE5;da', 'Efterr&#xE4;tter', 'F&#xE5;glar', 'Hundraser', 'Utrustat med &#xE4;rmar', 'Lagsporter', 'I julgranen', 'Saker du kan h&#xE5;lla i famnen', 'Str&#xE4;nginstrument', 'Helgdagar', 'Vilda djur i Sverige', 'Sminkgrejor', 'Sj&#xF6;ar i Sverige', 'Spr&#xE5;k', 'Tandkr&#xE4;msm&#xE4;rken', 'Ord som slutar p&#xE5; "-ig"', 'Kan du skriva p&#xE5; / i', 'Hos veterin&#xE4;ren', 'Svenska manliga sk&#xE5;despelare(efternamn)', 'Saker som &#xE4;r naturligt varma', 'Amerikanska stater', 'S&#xE4;llskapsdjur', 'Bensinbolag', 'Namn p&#xE5; tuggummin', 'Borstar', 'Ostsorter', 'Ord som inneh&#xE5;ller "&#xF6;"', 'Vaggvisor', 'Kaffesorter', 'Vilda blommor', 'Hos fris&#xF6;ren', 'Utl&#xE4;ndska f&#xF6;rfattare', 'M&#xF6;bler', 'Uniformer', 'Kattraser', 'Vad s&#xE4;ger djuren', 'Boendeformer', 'Saker som kan rulla', 'Genomskinliga saker', 'F&#xF6;rem&#xE5;l du kan sitta p&#xE5;', 'B&#xF6;cker', 'Svenska TV - k&#xE4;ndisar(efternamn)', 'ojknamn som slutar p&#xE5; "r"'],

	Boards: [BoardSetup.Q()],

	Dice: [
		Die.Q(['1', '2', '3', '4', '5', '6']),
		Die.Q(['15', '15', '30', '30', '+1', '-1'])
	],

	//returns a question and a value from the type die
	GetDice: function () {
		return [this.Cards.splice(Math.random() * this.Cards.length, 1), this.Dice[1].Roll(), 1 + Math.floor(Math.random() * 6)];
	},

	//returns a board with index
	GetBoards: function (data) {
		var boardNum = data; //Math.max(Math.min(this.Boards.length - 1, data), 0);

		//logic preventing selection of nonexsisten boards
		if (boardNum > this.Boards.length - 1) { boardNum = 0; }
		if (boardNum < 0) { boardNum = this.Boards.length - 1; }

		//retuns the render of the board
		return [boardNum, this.Boards[boardNum].Render()];
	}
};