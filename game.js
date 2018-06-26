class Game{
    // Multiple games per browser are possible to implement quite easily
    constructor(){
        this.setup = {};
        this.setup.$teamListing = $("#team-listing");
        this.setup.$songListing = $("#song-listing");
        this.$gameArea = $("#game-area");
        this.$songWrapper = $("#song-wrapper");
        this.songs =  [];
        this.teams = [];
        this.liveGame = false;
    }
    addTeam(team){
        this.teams.push(team);
    }
    addSong(song){
        this.songs.push(song);
    }
    getNewTeam(){
        this.addTeam(new Team($("#team-name").val(),rndColor(),this));
        $("#team-name").val(""); // wipe input field clear
    }
    getNewSong(){
        var sName = $("#song-name").val();
        $("#song-name").val("");
        var sLyrics = $("#song-lyrics").val();
        $("#song-lyrics").val("");
        this.addSong(new Song(sName, sLyrics, this));
    }
    startGame(){
        // TODO: add real settings
        // TODO: hide songs on game start
        // TODO: add button to reveal songs
        // TODO: initialise ui elements shown to players
        // TODO: make game controls for game master
        this.settings = {
            time: 30,
            trapsPerLevel: 0,
        };
        this.liveGame = true;
        if (this.songs.length > 0 && this.teams.length > 0){
            this.currentSongId = 0;
            this.currentTeamId = 0;
            this.placeCurrentSong();

        } else {
            alert("Game can't be started without a team or song.");
        }

    }

    songCorrect(){

    }
    newTry(){

    }
    placeCurrentSong(){
        this.songs[this.currentSongId].makeCurrentSong();
    }

}


class Team{
    constructor(name, color, parentGame){
        this.name = name;
        this.color = color;
        this.score = 0;
        this.wonSongs = [];
        this.parentGame = parentGame;
        this.placeInEditor();
    }
    placeInEditor(){
        this.$team = $($("#team-template").html());
        this.parentGame.setup.$teamListing.append(this.$team);
        this.$team.children(".team-name").text(this.name);
        var indicator = this.$team.children(".color-indicator");
        indicator.text(this.color);
        indicator.css('background',this.color);
        if (isColorDark(this.color)){
            indicator.addClass("dark");
        } else {
            indicator.addClass("light");
        }



        // TODO: make things editable. Turn fields into inputs with data synced to variables.
        // TODO: "remove team" -button
    }
}

function isColorDark(bg){
    //double a = 1 - ( 0.299 * color.R + 0.587 * color.G + 0.114 * color.B)/255;
    // copied from stack overflow. Eyes see green brighter than others.

    if (bg.length == 7) {
        var r = parseInt(bg.slice(1, 3),16);
        var g = parseInt(bg.slice(3, 5),16);
        var b = parseInt(bg.slice(5, 7),16);
    } else if (bg.length == 4){
        var r = parseInt(bg[1],16)*15;
        var g = parseInt(bg[2],16)*15;
        var b = parseInt(bg[3],16)*15;
    } else {
        console.log("Invalid color given to isColorDark.")
    }
    return euc(r,g,b)<0.6;
    /*var A = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (A<0.5){
        return true;
    } else {
        return false;
    }*/
}
function euc(r,g,b){
    return (r**2+g**2+b**2)**0.5/441.6729559300637;
}

class Song{
    constructor(name, lyrics, parentGame){
        this.name = name;
        this.lyrics = lyrics;
        this.parentGame = parentGame;
        this.wordList = this.getParsedLyrics();
        this.gameCards = [];
        this.active = false;
        this.addCardToEditor();
    }
    /* // useless.
    addCardsToEditor(){
        // Create div for cards to go
        // make cards and place them in div
        this.$editCardArea = $($("#edit-card-area-template").html());
        this.parentGame.setup.$songListing.append(this.$editCardArea);
        this.$editCardArea.children(".title").text(this.name);
        this.editCards =[];
        var l = this.lyrics.split(" ");
        for (var i=0;i<l.length;++i){
            this.editCards.push(new EditCard(l[i], this));
        }
    }*/
    addCardToEditor(){
        this.$editSong = $($("#edit-song-template").html());
        this.parentGame.setup.$songListing.append(this.$editSong);
        this.$editSong.children(".edit-song-title").val(this.name);
        this.$editSong.children(".edit-lyrics").val(this.lyrics);
        this.updateEditorCounter();
        // TODO: change to keydown but make it work consistently with single letter words.
        this.$editSong.children(".edit-lyrics").on("keyup change", this.updateLyrics.bind(this));
        this.$editSong.children(".edit-song-title").on("keyup change", this.updateTitle.bind(this));
        // TODO: add prompt to add dots to long words in places where word break is possible
    }
    makeCurrentSong(){
        this.gameCards =[];
        for (var i=0;i<this.wordList.length;++i){
            this.gameCards.push(new GameCard(this.wordList[i], i+1, this));
        }
    }
    updateEditorCounter(){
        //console.log("counter update called");
        this.wordList = this.getParsedLyrics();
        this.$editSong.find(".n").text(this.wordList.length);
    }
    getParsedLyrics(){
        // TODO: replace with shy not tested
        // Shy will break words with a hyphen when needed
        return this.lyrics.replace(".","&shy;").split(" ").filter(word => word !== "");
    }
    updateLyrics(){
        this.lyrics = this.$editSong.children(".edit-lyrics").val();
        this.updateEditorCounter();
    }
    updateTitle(){
        this.name = this.$editSong.children(".edit-song-title").val();
    }
}

/* // Useless.
class EditCard{
    constructor(word,parentSong){
        // create html
        // place it in right place
        // bind all keypresses to trigger parent song lyricsd updater
        this.word = word;
        this.$card = $($("#edit-card-template").html());
        this.parentSong = parentSong;
        this.parentSong.$editCardArea.append(this.$card);
        this.$card.children(".edit-word").val(this.word);
        this.$card.children(".edit-word").on("keydown",this.updateLyrics.bind(this));
    }
    updateLyrics(){
        // Keep variable always equivalent to input field
        this.word = this.$card.children(".edit-word").val();
        this.parentSong.getNewLyrics();
    }
}
*/
class GameCard{
    constructor(word, n, parentSong){
        this.word = word;
        this.n = n;
        this.$card = $($("#card-template").html());
        this.parentSong = parentSong;
        this.parentSong.parentGame.$songWrapper.append(this.$card);
        this.$card.children(".number").text(this.n);
        this.$card.children(".word").text(this.word);
        this.$card.click(this.reveal.bind(this));
    }
    reveal(){
        // TODO: add interaction with game
        this.$card.addClass("revealed");
    }
}

function defocus(event){
    // TODO: put focus on something else
    if (event.keyCode==27){
        this.blur();
    }
}

function bindButtons(){
    // TODO: make this Game's method
    $("#add-team").click(game.getNewTeam.bind(game));
    $("#add-song").click(game.getNewSong.bind(game));
    $("#game-start").click(game.startGame.bind(game));

    $("input").on("keydown", defocus);
}

function rndColor(){
    var n = Math.floor(Math.random()*16777215).toString(16);
    return "#"+"0".repeat(6-n.length)+n;
}


$(function(){
    game = new Game();
    bindButtons();
});
