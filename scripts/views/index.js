// Game world settings
var ballRadius = 30;
var ballDiameter = 2 * ballRadius;

var settings = {
    ball: {
        radius: ballRadius,
        diameter: ballDiameter,
        addInterval: 1000,
        attributes: {
            label: "ball",
            render: {
                sprite: {
                    texture: "content/basketball.png",
                    xScale: ballDiameter/800, // 800 is the original pixel height of the image
                    yScale: ballDiameter/797, // 797 is the original pixel width of the image
                    xOffset: 0.5,
                    yOffset: 0.5
                }
            }
        }
    },
    gravity: {
        x: 0,
        y: 1
    },
    tracking: {
        colors: ["yellow", "cyan", "magenta"]
    }
};

// Information about the game world
var parent = document.querySelector("#world");
var container = {
    element: parent,
    height: parent.getBoundingClientRect().height,
    width: parent.getBoundingClientRect().width
};

// Create the game world
var engine = Matter.Engine.create();
var render = Matter.Render.create({
    element: container.element,
    engine: engine,
    options: {
        background: "transparent",
        height: container.height,
        width: container.width,
        wireframes: false
    }
});

// Create the basket and ground
var basket = Matter.Bodies.rectangle(-100, -100, 100, 100, {
    label: "basket",
    isSensor: true,
    isStatic: true
});

var thickness = 10;
var ground = Matter.Bodies.rectangle(container.width/2, container.height + (thickness/2), container.width, thickness, { 
    label: "ground",
    isStatic: true,
    isSensor: true
});

// Add basket and ground to the game world
engine.world = Matter.World.create({
    bodies: [basket, ground],
    gravity: settings.gravity,
});

// Start the game world
Matter.Engine.run(engine);
Matter.Render.run(render);

// Add random balls
var getRandomIntInclusive = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var y = 0;
var addBall = function() {
    var x = getRandomIntInclusive(settings.ball.diameter, container.width - settings.ball.diameter);

    var ball = Matter.Bodies.circle(x, y, settings.ball.radius, settings.ball.attributes);

    Matter.World.add(engine.world, ball);
};

setInterval(addBall, settings.ball.addInterval);

// Handle collisions
var baskets = 0;
var misses = 0;
var basketsCounter = document.querySelector("#baskets em");
var missesCounter = document.querySelector("#misses em");
Matter.Events.on(engine, "collisionActive", function(event) {
    for(var i = 0; i < event.pairs.length; i++) {
        var pair = event.pairs[i];
    
        if(pair.bodyB.label === "ball") {
            if(pair.bodyA.label === "basket") {
                basketsCounter.textContent = ++baskets;
            } else if(pair.bodyA.label === "ground") {
                missesCounter.textContent = ++misses;
            }
            
            Matter.World.remove(engine.world, [pair.bodyB]);
        }
    }
});

// Setup color tracking
var colorTracker = new tracking.ColorTracker(settings.tracking.colors);

colorTracker.on("track", function(event) {
    if(event.data.length !== 0) {
        event.data.forEach(function(rect) {
            var xOffset = (rect.width/2);
            var yOffset = (rect.height/2);

            var x = container.width - (rect.x + xOffset); // Subtract from container.width because video is a mirror image
            var y = rect.y + yOffset;

            Matter.Body.set(basket, {
                vertices: [ {
                    x: x,
                    y: y
                },{
                    x: x + rect.width,
                    y: y
                },{
                    x: x + rect.width,
                    y: y + rect.height
                },{
                    x: x,
                    y: y + rect.height
                }],
                position: {
                    x: x,
                    y: y
                },
                render: {
                    visible: true,
                    sprite: {
                        texture: "content/hoop.png",
                        xScale: rect.width/976,
                        yScale: rect.height/711,
                        xOffset: 0.5,
                        yOffset: 0.5
                    }
                }    
            });
        });
    }
});

tracking.track("#video", colorTracker, { 
    camera: true
});
