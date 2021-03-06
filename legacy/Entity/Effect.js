
/*
 * effect is a class which can produce a number of effects
 * properties can be animated from A to B
 */

define(['../core', 
        '../system', 
        '../Point', 
        '../dynamics/Particle', 
        './Entity'],
        function(core, sys, Point, Particle,Entity){
	
		var screen = sys.screen;

		var efxParticle = Particle.extend({
			lifeTime : 0,
			remove : false,
			nibble : false,
			init : function(pos, colorA, colorB, time) {
				this.cA = colorA;
				this.cB = colorB;
				this.efxColor = colorA;
				this.time = time;

				this._super(pos.x, pos.y, 1);
			},
			update : function(ticks) {
				this.lifeTime += ticks;
				var t = this.lifeTime;
				this.efxColor = {
					r : core.mapto(t, 0, this.time, this.cA.r, this.cB.r),
					g : core.mapto(t, 0, this.time, this.cA.g, this.cB.g),
					b : core.mapto(t, 0, this.time, this.cA.b, this.cB.b),
					a : core.mapto(t, 0, this.time, this.cA.a, this.cB.a)
				};

				if (this.time < this.lifeTime) {
					this.remove = true;
				}
				this._super(ticks);
			},
			draw : function(world) {
				var sp = world.cam.toScreenPos(this.p);
				var c = screen.color(this.efxColor.r, this.efxColor.g,
						this.efxColor.b, this.efxColor.a);
				if (this.nibble) {
					screen.fill = 0;
					screen.stroke = c;
					var lsp = toScreen(this.lp);
					screen.line(sp,lsp);
				}
				if (this.fill) {
					screen.fill = c;
					screen.stroke = 0;
				} else {
					screen.fill = 0;
					screen.stroke = c;
				}
				screen.circle(sp, this.r);
			}
		});
		var efxCircular = efxParticle.extend({
			init : function(pos, colorA, colorB, time, radiusA, radiusB,
					fill) {
				this._super(pos, colorA, colorB, time);

				this.rA = radiusA;
				this.rB = radiusB;
				this.fill = false;
				if (typeof (fill) !== 'undefined') {
					this.fill = fill;
				}
			},
			update : function(ticks) {
				this._super(ticks);
				this.r = core.mapto(this.lifeTime, 0, this.time, this.rA,
						this.rB);
			}
		});

		var Effect = Entity.extend({
			isEffect : true,
			time : 1000,
			parts : [],
			updateFn : null,
			lp : new Point(0, 0),
			init : function(type, pos, follow) {
				this._super('effect:' + type, pos);
				this.efxColor = screen.color(255, 0, 255);
				this.parts = [];
				this.follow = follow;
			},
			update : function(ticks) {
				var d = this.p.dif(this.lp);
				this._super(ticks);

				if (typeof (this.updateFn) === 'function') {
					this.updateFn(ticks);
				}
				if (this.time < this.lifeTime) {
					this.remove = true;
				}
				for ( var i = 0; i < this.parts.length; i++) {
					this.parts[i].update(ticks);
					if (this.follow) {
						this.parts[i].move(d);
					}
				}
				for ( var i = 0; i < this.parts.length; i++) {
					if (this.parts[i].remove) {
						this.parts.splice(i, 1);
					}
				}
				this.lp.copy(this.p);
			},
			onUpdate : function(fn) {
				this.updateFn = fn;
			},
			draw : function() {
				for ( var i = 0; i < this.parts.length; i++) {
					this.parts[i].draw(this.world);
				}
			}
		});

		Effect.Particle = efxParticle;
		Effect.Circular = efxCircular;

		return Effect;
});