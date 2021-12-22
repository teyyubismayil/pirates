let platform;
const numberOfPirates = 5;
const numberOfCoins = 100;
const pirates = [];
const coins = [];
const votes = [];

// Elements
const startGameDiv = document.getElementById('startGameDiv');
const startGameBtn = document.getElementById('startGameBtn');
const divisionDiv = document.getElementById('divisionDiv');
const endDiv = document.getElementById('endDiv');

function preload() {
    console.log('preload');
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('treasure', 'assets/treasure-resized.png')
    this.load.spritesheet('pirate',
        'assets/pirate.png',
        { frameWidth: 120, frameHeight: 120 }
    );
    this.load.spritesheet('pirate-rotaten',
        'assets/pirate-rotaten.png',
        { frameWidth: 120, frameHeight: 120 }
    );
    this.load.spritesheet('pirate-die',
        'assets/pirate-die.png',
        { frameWidth: 120, frameHeight: 120 }
    );
}

function create() {
    console.log('create');
    this.add.image(400, 300, 'sky');

    platform = this.physics.add.staticGroup();
    platform.create(400, 568, 'ground').setScale(2).refreshBody();

    startGameDiv.classList.remove('d-none');
    startGameBtn.onclick = (e) => {
        startGameDiv.classList.add('d-none');
        this.add.image(200, 520, 'treasure');

        pirates[0] = this.physics.add.sprite(100, 450, 'pirate');
        for (let i = 1; i < numberOfPirates; i++) {
            pirates[i] = this.physics.add.sprite(200 + i * 120, 450, 'pirate-rotaten');
        }

        pirates.forEach(p => {
            p.setBounce(0.2);
            p.setCollideWorldBounds(true);
            this.physics.add.collider(p, platform);
        });

        this.anims.create({
            key: 'upvote',
            frames: this.anims.generateFrameNumbers('pirate', { start: 0, end: 3 }),
            frameRate: 1.5,
            repeat: 0
        });

        this.anims.create({
            key: 'upvote-rotaten',
            frames: this.anims.generateFrameNumbers('pirate-rotaten', { start: 0, end: 3 }),
            frameRate: 1.5,
            repeat: 0
        });

        this.anims.create({
            key: 'fire',
            frames: this.anims.generateFrameNumbers('pirate-rotaten', { frames: [4, 5, 0] }),
            frameRate: 1.5,
            repeat: 0
        });

        this.anims.create({
            key: 'die',
            frames: this.anims.generateFrameNumbers('pirate-die', { start: 0, end: 6 }),
            frameRate: 2,
            repeat: 0
        });

        for (let i = 0; i < numberOfPirates; i++) {
            divisionDiv.innerHTML += `<br/>
                                      <label class="mb-2">
                                        Pirate ${i + 1} 
                                        <input id="pirate${i + 1}" type="number"/>
                                       </label>`
        }
        divisionDiv.innerHTML += '<br/><input id="divisionBtn" type="button" value="Start voting"/>';
        divisionDiv.classList.remove('d-none');
        document.getElementById('divisionBtn').onclick = (e) => {
            let isValid = true;
            let sum = 0;
            for (let i = 0; i < numberOfPirates && isValid; i++) {
                console.log(i)
                const ith = parseInt(document.getElementById('pirate' + (i + 1)).value);
                if (!ith && ith !== 0) {
                    console.log('incorrect');
                    isValid = false;
                } else {
                    coins[i] = ith;
                    sum += ith;
                }
            }
            if (isValid && sum === numberOfCoins) {
                divisionDiv.classList.add('d-none');
                console.log(coins);
                startVoting(this);
            } else {
                console.log('incorrect');
            }
        };
    };
}

function update() {
    console.log('update');
}

// 2 - 1ə, 3 - 2ə, 4 - 3ə, 5 - 4ə tabedir.
function startVoting(context) {
    let votesCount = 1;
    console.log('Pirate 0 upvote');
    votes[0] = true;
    pirates[0].play({ key: 'upvote'});
    for (let i = 1; i < numberOfPirates; i++) {
        if (coins[i] === 0 || (coins[i] === 1 && i % 2 === 1)) {
            console.log(`Pirate ${i + 1} downvote`);
            votes[i] = false;
        } else {
            console.log(`Pirate ${i + 1} upvote`);
            votesCount++;
            votes[i] = true;
            pirates[i].play({ key: 'upvote-rotaten'});
        }
    }
    console.log(`Votes: ${votesCount} ${votes}`);
    setTimeout(() => {
        if (votesCount < 3) {
            console.log('Game lost');
            fire();
            setTimeout(() => {
                endDiv.innerHTML += `<p>Game lost<p/><br/><input onclick="restart()" type="button" value="Restart"/>`;
                endDiv.classList.remove('d-none');
            }, 3_000);
        } else {
            let message;
            if (coins[0] === 98) {
                message = 'Excellent game!';
            } else {
                message = 'You won but you could get more money';
            }
            endDiv.innerHTML += `<p>${message}<p/><br/><input onclick="restart()" type="button" value="Restart"/>`;
            endDiv.classList.remove('d-none');
        }
    }, 5_000);
}

function restart() {
    location.reload();
}

function fire() {
    for (let i = 1; i < numberOfPirates; i++) {
        if (votes[i] === false) {
            console.log(`Pirate ${i + 1} fire`);
            pirates[i].play({ key: 'fire'});
        }
    }
    pirates[0].play({ key: 'die'});
}

function die() {

}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 300
            },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Main
const game = new Phaser.Game(config);
