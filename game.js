class Game{
    constructor(){
        this.setup = {};
        this.setup.$teamListing = $("#team-listing");
        this.setup.$songListing = $("#song-listing");
        this.$currentGame = $("#game-area");
        this.songs =  [];
        this.teams = [];
        this.liveGame = false;
        //me = this;
    }
    addTeam(team){
        this.teams.push(team);
    }
    addSong(song){
        this.songs.push(song);
    }
    getNewTeam(){
        this.addTeam(new Team($("#team-name").val(),rndColor()));
        this.$("#team-name").val(""); // wipe input field clear
    }
    getNewSong(){
        var sName = $("#song-name").val();
        $("#song-name").val("");
        var sLyrics = $("#song-lyrics").val();
        $("#song-lyrics").val("");
        this.addSong(new Song(sName, sLyrics, this));
    }

}


class Team{
    constructor(name, color, parentGame){
        this.name = name;
        this.color = color;
        this.score = 0;
        this.wonSongs = [];
        this.parentGame = parentGame;
    }
}

class Song{
    constructor(name, lyrics, parentGame){
        this.name = name;
        this.lyrics = lyrics;
        this.parentGame = parentGame;
        this.editCards = [];
        this.active = false;
        this.addCardsToEditor();
    }
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
    }
    getNewLyrics(){

    }
}

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


function bindButtons(){
    // TODO: make this Game's method
    $("#add-team").click(game.getNewTeam.bind(game));
    $("#add-song").click(game.getNewSong.bind(game));
}

function rndColor(){
    return "#"+Math.floor(Math.random()*16777215).toString(16);
}


$(function(){
    game = new Game();
    bindButtons();
})
