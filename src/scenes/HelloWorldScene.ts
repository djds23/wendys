
import Phaser from 'phaser'


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
    p1Idle: Phaser.GameObjects.Sprite | null = null
    p1Attack: Phaser.GameObjects.Sprite | null = null

    p1Sprite: Phaser.GameObjects.Sprite | null = null

    pad: Phaser.Input.Gamepad.Gamepad | null = null
}

export default class HelloWorldScene extends Phaser.Scene
{
    current: Current = new Current();
	constructor()
	{
		super('hello-world')
	}

	preload()
    {
        this.load.setBaseURL('http://localhost:8000')

        this.load.spritesheet(BlueWitch.attack.key, BlueWitch.attack.path, BlueWitch.attack.frameConfig)
        this.load.spritesheet(BlueWitch.idle.key, BlueWitch.idle.path, BlueWitch.idle.frameConfig)
    }

    create()
    {
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
        
        this.current.p1Idle = this.add.sprite(0, 400, BlueWitch.idle.key, 0)
        this.current.p1Idle.setOrigin(0, 0)
        this.current.p1Idle.setScale(3)


        this.current.p1Attack = this.add.sprite(this.current.p1Idle.x, this.current.p1Idle.y, BlueWitch.attack.key, 0)
        this.current.p1Attack.setOrigin(0, 0)
        this.current.p1Attack.setScale(3)

        if (this.input.gamepad.total === 0)
        {
            this.input.gamepad.once('connected', pad => {

                this.current.pad = pad;

                pad.on('down', (index, value, button) => {

                    if (index === 0)
                    {
                        this.attack()
                    }

                });

            });
        }
        else
        {
            this.current.pad = this.input.gamepad.pad1;
        }
        this.current.p1Attack.setVisible(false)
        this.current.p1Idle.play("idle")
        this.current!.p1Sprite = this.current.p1Idle
    }

    attack() {
        if (this.current != null) { 
            this.current.p1Attack?.setX(this.current!.p1Sprite.x)
            this.current.p1Attack?.setY(this.current!.p1Sprite.y)
            this.current.p1Sprite?.setVisible(false)
            this.current.p1Attack?.setVisible(true)
            this.current.p1Sprite = this.current.p1Attack
            this.current.p1Attack?.play('attack').on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim, frame, gameObject) => {
                this.current.p1Attack?.setVisible(false)
                this.current.p1Sprite = this.current.p1Idle
                this.current.p1Sprite?.setVisible(true)
            });
        } else {
            console.warn("Attacking without a current state");
        }
    }
}


