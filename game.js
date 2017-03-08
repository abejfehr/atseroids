// Ship constants
const MAX_VELOCITY = 5;
const SPEED = 0.3;
const DRAG = 0.99;
const TURNING_RATE = 5 * Math.PI / 180;

// Bullet constants
const MAX_BULLETS = 6;
const BULLET_SPEED = 8;
const BULLET_SIZE = 12;

// Asteroid constants
const MAX_ASTEROIDS = 9;
const ASTEROID_SPEED = 1;
const MAX_ASTEROID_SIZE = 230;
const MIN_ASTEROID_SIZE = 65;
const MARGIN = 250;

// Other things
const TWO_PI = 2 * Math.PI;
const SCORE_LENGTH = 6;

var magnitude = function (x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

var collision = function (p1, p2, r1, r2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)) < (r1 + r2) / 2;
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
    this.element.className += 'asteroid';
    this.element.style.fontSize = `${Math.round(this.size)}px`;
    this.element.style.paddingTop = `${20 * this.size / MAX_ASTEROID_SIZE}px`;
    this.element.style.paddingLeft = `${20 * this.size / MAX_ASTEROID_SIZE}px`;

    document.body.appendChild(this.element);

    // Get the offset of the asteroid
    this.offset = {};
    var rect = this.element.getBoundingClientRect();
    this.offset.x = (rect.right + rect.left) / 2;
    this.offset.y = (rect.top + rect.bottom) / 2;

    this.element.style.transform = `translate(${this.position.x - this.offset.y}px, ${this.position.y - this.offset.y}px) rotate(${this.direction}rad)`;
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
    this.spin = -0.01 + Math.random() * 0.02;
    this.size = MIN_ASTEROID_SIZE + Math.random() * (MAX_ASTEROID_SIZE - MIN_ASTEROID_SIZE);
    if (this.element) {
      this.element.style.transform = `translate(${this.position.x - this.offset.x}px, ${this.position.y - this.offset.y}px) rotate(${this.direction}rad)`
    }
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
    if (!(this.position.x + this.offset.x < 0 ||
        this.position.x + this.offset.y < 0 ||
        this.position.x - this.offset.x > windowWidth ||
        this.position.y - this.offset.y > windowHeight)) {
        this.element.style.transform = `translate(${this.position.x - this.offset.x}px, ${this.position.y - this.offset.y}px) rotate(${this.direction}rad)`
    }

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
    this.element = document.createElement('div');
    this.element.className += 'bullet';
    this.element.style.width = `${BULLET_SIZE}px`;
    this.element.style.height = `${BULLET_SIZE}px`;
    document.body.appendChild(this.element);

    this.offset = {};
    var rect = this.element.getBoundingClientRect();
    this.offset.x = (rect.right + rect.left) / 2;
    this.offset.y = (rect.top + rect.bottom) / 2;

    this.element.style.transform = `translate(${this.position.x - this.offset.x}px, ${this.position.y - this.offset.y}px)`
  }

  die () {
    this.alive = false;
    this.element.style.display = 'none';
  }

  shoot (position, speed, direction) {
    this.alive = true;
    this.position = position;
    this.velocity.x = speed * Math.cos(direction);
    this.velocity.y = speed * Math.sin(direction);
    this.element.style.display = 'inline-table';
  }

  update () {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.element.style.transform = `translate(${this.position.x - this.offset.x}px, ${this.position.y - this.offset.y}px)`

    // See if the bullet should die
    if (this.position.x < 0 || this.position.x > windowWidth ||
        this.position.y < 0 || this.position.y > windowHeight) {
      this.die();
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
    this.flame = document.querySelector('.flame');

    // Change the positioning of the caret
    this.element.style.visibility = 'visible';
    this.element.style.position = 'absolute';
    this.element.style.left = 0;
    this.element.style.right = 0;

    this.offset = {};
    var rect = this.element.getBoundingClientRect();
    this.offset.x = (rect.right + rect.left) / 2 - x;
    this.offset.y = (rect.top + rect.bottom) / 2 - y;

    this.position = {
      x: x,
      y: y + this.offset.y,
    }
    this.element.style.transform = `translate(${this.position.x - this.offset.x}px, ${this.position.y - this.offset.y}px) rotate(${this.direction}rad)`
    document.getElementById('container').style.padding = 0;
  }

  reset () {
    this.position.x = windowWidth / 2;
    this.position.y = windowHeight / 2;
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
      this.flame.style.display = 'block';
    } else {
      this.flame.style.display = 'none';
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

    this.element.style.transform = `translate(${this.position.x}px, ${this.position.y - this.offset.y}px) rotate(${this.direction}rad)`;

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
      if (i < MAX_BULLETS) {
        this.bullets.push(new Bullet());
      }
      if (i < MAX_ASTEROIDS) {
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
    document.body.addEventListener('keydown', (e) => {
      this.handleKeyDown(e.keyCode);
      e.preventDefault();
    });
    document.body.addEventListener('keyup', (e) => {
      this.handleKeyUp(e.keyCode);
      e.preventDefault();
    });
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
      if (i < MAX_BULLETS) {
        // For every bullet, let's check to see if it's within an asteroid
        if (this.bullets[i].alive) {
          this.bullets[i].update();
          for (let j = 0; j < MAX_ASTEROIDS; ++j) {
            if (collision(this.bullets[i].position, this.asteroids[j].position, BULLET_SIZE, this.asteroids[j].element.offsetWidth)) {
              this.bullets[i].die();
              this.asteroids[j].die();
              this.score += this.asteroids[j].size;
            }
          }
        }
      }
      if (i < MAX_ASTEROIDS) {
        this.asteroids[i].update();
        // Additionally, check to see if the player is inside that asteroid
        if (collision(this.asteroids[i].position, this.ship.position, this.asteroids[i].element.offsetWidth, this.ship.element.offsetWidth)) {
          this.ship.reset();
          this.score = 0;
        }
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
