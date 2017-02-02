// Ship constants
const MAX_VELOCITY = 5;
const SPEED = 0.3;
const DRAG = 0.99;
const TURNING_RATE = 5 * Math.PI / 180;

// Bullet constants
const MAX_BULLETS = 6;
const BULLET_SPEED = 8;

// Asteroid constants
const MAX_ASTEROIDS = 3;
const ASTEROID_SPEED = 1;
const MAX_ASTEROID_SIZE = 130;
const MIN_ASTEROID_SIZE = 65;
const MARGIN = 105;

// Other things
const TWO_PI = 2 * Math.PI;
const SCORE_LENGTH = 6;

var magnitude = function(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

class Asteroid {
  constructor () {
    this.velocity = {
      x: 0, y: 0,
    }
    this.position = {
      x: 0, y: 0,
    }
    this.direction = 0;
    this.spin = 0;
    this.size = 0;

    this.spawn();

    // Make the actual asteroid
    this.element = document.createElement('h1');
    this.element.innerText = '@';
    this.element.style.position = 'absolute';
    this.element.style.margin = 0;
    this.element.style.top = 0;
    this.element.style.left = 0;
    this.element.style.fontSize = this.size + 'px';
    this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px) rotate(${this.direction}rad)`
    document.body.appendChild(this.element);
  }

  spawn () {
    if (Math.random() > 0.5) {
      this.position.x = Math.random() > 0.5 ? Math.random() * MARGIN + windowWidth : 0 - Math.random() * MARGIN;
      this.position.y = Math.random() * windowHeight;
    }
    else {
      this.position.x = Math.random() * windowWidth;
      this.position.y = Math.random() > 0.5 ? Math.random() * MARGIN + windowHeight :  0 - Math.random() * MARGIN;
    }
    this.velocity.x = Math.random() * ASTEROID_SPEED - ASTEROID_SPEED / 2;
    this.velocity.y = Math.random() * ASTEROID_SPEED - ASTEROID_SPEED / 2;
    this.direction = Math.random() * TWO_PI;
    this.spin = Math.random() * 0.01 - 0.02;
    this.size = MIN_ASTEROID_SIZE + Math.random() * (MAX_ASTEROID_SIZE - MIN_ASTEROID_SIZE);
  }

  die () {
    // Respawn
    this.spawn();
  }

  update () {
    // Move the thing around
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.direction += this.spin;
    this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px) rotate(${this.direction}rad)`

    // Kill this asteroid and make a new one maybe
    if (this.position.x < -MARGIN || this.position.x > windowWidth + MARGIN ||
        this.position.y < -MARGIN || this.position.y > windowHeight + MARGIN) {
          this.spawn();
    }
  }
}

class Bullet {
  constructor () {
    this.alive = false;
    this.velocity = {
      x: 0, y: 0,
    }
    this.position = {
      x: 0, y: 0,
    }

    // Make the actual bullet
    this.element = document.createElement('h1');
    this.element.innerText = '.';
    this.element.style.display = 'none';
    this.element.style.position = 'absolute';
    this.element.style.margin = 0;
    this.element.style.top = 0;
    this.element.style.left = 0;
    this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`
    document.body.appendChild(this.element);
  }

  die () {
    this.alive = false;
  }

  shoot (position, speed, direction) {
    this.alive = true;
    this.position = position;
    this.velocity.x = speed * Math.cos(direction);
    this.velocity.y = speed * Math.sin(direction);
    this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    this.element.style.display = 'inline-table';
  }

  update () {
    if (this.alive) {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`

      // See if the bullet should die
      if (this.position.x < 0 || this.position.x > windowWidth) {
        this.alive = false;
      } else if (this.position.y < 0 || this.position.y > windowHeight) {
        this.alive = false;
      }
    } else {
      this.element.style.display = 'none';
    }
  }
}

class Ship {
  constructor () {
    this.element = document.getElementById('caret');

    this.velocity = {
      x: 0,
      y: 0,
    };
    this.direction = 0;

    // Set up what x and y are
    var bodyRect = document.body.getBoundingClientRect();
    var caretRect = this.element.getBoundingClientRect();
    var x = caretRect.top - bodyRect.top;
    var y = caretRect.left - bodyRect.left;

    // Change the positioning of the caret
    this.element.style.visibility = 'visible';
    this.element.style.position = 'absolute';
    this.element.style.left = 0;
    this.element.style.right = 0;
    this.element.style.transform = `translate(${x}px, ${y}px) rotate(${this.direction}rad)`
    document.getElementById('container').style.padding = 0;

    this.position = {
      x, y,
    }
  }

  reset () {
    this.position.x = windowWidth / 2;
    this.position.y = windowHeight / 2;
    this.direction = -Math.PI / 2;
  }

  accelerate (speed) {
    // Figure out how much we'll be increasing the velocity by
    var dx = speed * Math.cos(this.direction);
    var dy = speed * Math.sin(this.direction);

    // Increase the velocity
    if (magnitude(this.velocity.x + dx, this.velocity.y + dy) <= MAX_VELOCITY) {
      this.velocity.x = this.velocity.x + dx;
      this.velocity.y = this.velocity.y + dy;
    }
  }

  decelerate (speed) {
    this.velocity.x *= speed;
    this.velocity.y *= speed;
  }

  turnLeft (rate) {
    this.direction = (TWO_PI + this.direction - rate) % TWO_PI;
  }

  turnRight (rate) {
    this.direction = (TWO_PI + this.direction + rate) % TWO_PI;
  }

  update () {
    // Handle the keys
    if (keys[UP]) {
      this.accelerate(SPEED);
    }
    if (keys[LEFT]) {
      this.turnLeft(TURNING_RATE);
    }
    if (keys[RIGHT]) {
      this.turnRight(TURNING_RATE);
    }

    // This is where the ship's shit will be updated
    this.position.x = (this.position.x + windowWidth + this.velocity.x) % windowWidth;
    this.position.y = (this.position.y + windowHeight + this.velocity.y) % windowHeight;

    this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px) rotate(${this.direction}rad)`;

    // Decelerate a bit
    this.decelerate(DRAG);
  }
}

class Game {
  constructor () {
    this.bullets = [];
    this.asteroids = [];
    this.bulletIndex = 0;
    this.last = 0;
    this.score = 0;
    for (let i = 0; i < Math.max(MAX_BULLETS, MAX_ASTEROIDS); ++i) {
      if (i <= MAX_BULLETS) {
        this.bullets.push(new Bullet());
      }
      if (i <= MAX_ASTEROIDS) {
        this.asteroids.push(new Asteroid());
      }
    }
    this.ship = new Ship();
  }

  start () {
    // Start the game loop, using animation frames
    var updateWrapper = function (timestamp) {
      this.update(timestamp);
      window.requestAnimationFrame(updateWrapper);
    }.bind(this);
    window.requestAnimationFrame(updateWrapper);

    // Get keypresses
    document.body.addEventListener('keydown', (e) => this.handleKeyDown(e.keyCode));
    document.body.addEventListener('keyup', (e) => this.handleKeyUp(e.keyCode));
  }

  handleKeyDown (key) {
    keys[key] = true;
  }

  handleKeyUp (key) {
    keys[key] = false;
  }

  update (timestamp) {
    // The game update loop
    this.ship.update();

    if (keys[SPACE] && timestamp - this.last > 250) {
      this.bullets[this.bulletIndex++ % MAX_BULLETS].shoot(Object.assign({}, this.ship.position), BULLET_SPEED, this.ship.direction);
      this.last = timestamp;
    }


    for (let i = 0; i < Math.max(MAX_BULLETS, MAX_ASTEROIDS); ++i) {
      if (i <= MAX_BULLETS) {
        this.bullets[i].update();

        // For every bullet, let's check to see if it's within an asteroid
        if (this.bullets[i].alive) {
          for (let j = 0; j < MAX_ASTEROIDS; ++j) {
            var bp = this.bullets[i].position;
            var ap = this.asteroids[j].position;
            var sp = this.ship.position;
            if (magnitude(bp.x - ap.x, bp.y - ap.y) < this.asteroids[j].size / 2) {
              this.bullets[i].die();
              this.asteroids[j].die();
              this.score += this.asteroids[j].size;
            }
            // Additionally, check to see if the player is inside that asteroid
            if (magnitude(ap.x - sp.x, ap.y - sp.y) < this.asteroids[j].size / 2) {
              this.ship.reset();
              this.score -= 50;
            }
          }
        }
      }
      if (i <= MAX_ASTEROIDS) {
        this.asteroids[i].update();
      }
    }

    // Normalize the score
    this.score = Math.round(this.score / 5) * 5;
    var str = '' + this.score;
    while (str.length < SCORE_LENGTH) {
        str = '0' + str;
    }
    score.innerText = str;
  }
}
