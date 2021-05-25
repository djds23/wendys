import Phaser from 'phaser'
import PlayerState from './Fight/PlayerState'
import { HorizontalMovement, MovementUpdate } from './Fight/Movement'
import TimeUpdate from './Fight/Time'
import Environment from '../Environment'

interface Asset {
    key: string
    path: string
    frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig | undefined
}

class BlueWitch {
    static attack: Asset = {
        key: "assets/images/Blue_witch/B_witch_attack.png",
        path: "assets/images/Blue_witch/B_witch_attack.png",
        frameConfig: {
            frameWidth: 104,
            frameHeight: 46
        }
    }

    static idle: Asset = {
        key: "assets/images/Blue_witch/B_witch_idle.png",
        path: "assets/images/Blue_witch/B_witch_idle.png",
        frameConfig: {
            frameWidth: 32,
            frameHeight: 48

        }
    }
}

class Current {
    p1: PlayerState | null = null
    pad: Phaser.Input.Gamepad.Gamepad | null = null
}

export default class FightScene extends Phaser.Scene {
    current: Current = new Current();
    constructor() {
        super('FightScene')
    }

    preload() {
        this.load.setBaseURL(Environment.baseURL)

        this.load.spritesheet(BlueWitch.attack.key, BlueWitch.attack.path, BlueWitch.attack.frameConfig)
        this.load.spritesheet(BlueWitch.idle.key, BlueWitch.idle.path, BlueWitch.idle.frameConfig)
    }

    create() {
        // Animation set
        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers(BlueWitch.idle.key, { frames: [0, 1, 2, 3, 4, 5] }),
            frameRate: 8,
            repeat: -1,
            duration: 2
        });

        // Animation set
        this.anims.create({
            key: "attack",
            frames: this.anims.generateFrameNumbers(BlueWitch.attack.key, { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8] }),
            frameRate: 9,
            duration: 0.1
        });

        let idle = this.physics.add.sprite(0, 400, BlueWitch.idle.key, 0)
        let attack = this.physics.add.sprite(0, 400, BlueWitch.attack.key, 0)
        this.current.p1 = new PlayerState(
            idle,
            attack
        )
        if (this.input.gamepad.total === 0) {
            this.input.gamepad.once('connected', pad => {

                this.current.pad = pad;
                pad.on(Phaser.Input.Gamepad.Events.BUTTON_DOWN, (index, value, button) => {
                    if (index === 0) {
                        this.current.p1?.performAttack()
                    }
                });
            });
        }
        else {
            this.current.pad = this.input.gamepad.pad1;
        }
    }

    update(time, delta) {
        let timeUpdate = new TimeUpdate(time, delta)
        if (this.current.pad?.leftStick != null) {
            let direction = leftStickToMovement(this.current.pad?.leftStick)
            this.current.p1?.update(new MovementUpdate(direction, HorizontalMovement.RIGHT), timeUpdate)
        } else {
            this.current.p1?.update(null, timeUpdate)
        }
    }
}

function leftStickToMovement(vector: Phaser.Math.Vector2): HorizontalMovement {
    let ceiledX = Phaser.Math.Fuzzy.Ceil(vector.x)
    if (ceiledX < 0) return HorizontalMovement.LEFT;
    if (ceiledX > 0) return HorizontalMovement.RIGHT;
    return HorizontalMovement.STATIONARY; // If 0, then stationary
}