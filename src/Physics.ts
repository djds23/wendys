import * as planck from 'planck'

class PhysicsUpdate {
    // Position already adjusted for outer world
    // Box2D works with meters. We need to convert meters to pixels.
    adjustedPosition: planck.Vec2
    angle: number
    time: number
    // Should correspond to sprite.data.values.identifier
    identifier: string
    body: planck.Body

    constructor(
        adjustedPosition: planck.Vec2,
        angle: number,
        time: number,
        identifier: string,
        body: planck.Body
    ) {
        this.adjustedPosition = adjustedPosition
        this.angle = angle
        this.time = time
        this.identifier = identifier
        this.body = body
    }
}

// Phsyics type that should manager the placement of sprites according to the physics engine
// 
// Important terms: AABB (Axis Aligned Bounding Box)
// See: https://developer.mozilla.org/en-US/docs/Games/Techniques/3D_collision_detection
//
// Example phaser 3 game with this
// https://www.emanueleferonato.com/2019/10/12/use-box2d-physics-in-your-phaser-3-projects-with-planck-js-javascript-physics-engine/
// 
// Planck Library
// https://piqnt.com/planck.js/
//
// Some nice reference code here:
// https://github.com/notchris/phaser3-planck
type BodyCreatedCallback = (body: planck.Body) => void

class Physics {

    // Box2D works with meters. We need to convert meters to pixels.
    // let's say 30 pixels = 1 meter.
    //
    // From the docs on units https://github.com/shakiba/planck.js/wiki/Overview#units
    //
    // > Planck.js works with floating point numbers and tolerances have to be used to make Planck.js perform well. These tolerances have been tuned to work well with meters-kilogram-second (MKS) units. In particular, Planck.js has been tuned to work well with moving shapes between 0.1 and 10 meters. So this means objects between soup cans and buses in size should work well. Static shapes may be up to 50 meters long without trouble.
    // > Being a 2D physics engine, it is tempting to use pixels as your units. Unfortunately this will lead to a poor simulation and possibly weird behavior. An object of length 200 pixels would be seen by Planck.js as the size of a 45 story building.
    // > Caution: Planck.js is tuned for MKS units. Keep the size of moving objects roughly between 0.1 and 10 meters. You'll need to use some scaling system when you render your environment and actors. The Planck.js testbed does this by using stage.js viewbox transform. DO NOT USE PIXELS.
    //
    worldScale = 30;
    world: planck.World

    constructor() {
        let gravity = planck.Vec2(0, 3);
        this.world = planck.World(gravity)
    }

    get gameScale(): number {
        return this.worldScale * 0.001
    }

    // converts vectors from pixel space to meters for moving bodies
    pixelsToMeter(vec: planck.Vec2): planck.Vec2 {
        return vec.mul(this.gameScale)
    }

    // here we go with some Box2D stuff
    // arguments: x, y coordinates of the center, with and height of the box, in pixels
    // we'll conver pixels to meters inside the method
    // callback normally used to set the body as data on the sprite
    createBox(posX: number, posY: number, width: number, height: number, isDynamic: boolean, userData: string, didConstruct: BodyCreatedCallback | null) {
 
        // this is how we create a generic Box2D body
        let box = this.world.createBody();
        if(isDynamic){
            // Box2D bodies born as static bodies, but we can make them dynamic
            box.setDynamic();
        }
 
        let boxShape = planck.Box(width / 2 / this.worldScale, height / 2 / this.worldScale) as planck.Shape
        // a body can have one or more fixtures. This is how we create a box fixture inside a body
        box.createFixture(boxShape, undefined);
 
        // now we place the body in the world
        box.setPosition(planck.Vec2(posX / this.worldScale, posY / this.worldScale));
 
        // time to set mass information
        box.setMassData({
            mass: 1,
            center: planck.Vec2(),
            // I have to say I do not know the meaning of this "I", but if you set it to zero, bodies won't rotate
            I: 1
        });
 
        // now we create a graphics object representing the body
        // a body can have anything in its user data, normally it's used to store its sprite
        box.setUserData(userData);
        if (didConstruct != null) {
            didConstruct(box)
        }
    }

    update(time, delta): Map<string, PhysicsUpdate> {
        // advance the simulation by 1/20 seconds
        this.world.step(delta);

        // crearForces  method should be added at the end on each step
        this.world.clearForces();
        let output: Map<string, PhysicsUpdate> = new Map()
        // iterate through all bodies
        for (let b = this.world.getBodyList(); b; b = b.getNext()){

            // get body position
            let bodyPosition = b.getPosition();

            // get body angle, in radians
            let bodyAngle = b.getAngle();

            // get body user data, the graphics object
            let userData = b.getUserData() as string
            let update = new PhysicsUpdate(
                bodyPosition.mul(this.worldScale),
                bodyAngle, 
                time, 
                userData,
                b
            )
            output.set(userData, update)
        }
        return output
    }
} 

export {
    Physics,
    PhysicsUpdate
}