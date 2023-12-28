// Author: CY
// Title: 煮雪

/*
ref:

Cellular noise ("Worley noise") in 3D in GLSL.
Copyright (c) Stefan Gustavson 2011-04-19. All rights reserved.
This code is released under the conditions of the MIT license.
See LICENSE file for details.

Cellular noise, returning F1 and F2 in a vec2.
3x3x3 search region for good F2 everywhere, but a lot
slower than the 2x2x2 version.
The code below is a bit scary even to its author,
but it has at least half decent performance on a
modern GPU. In any case, it beats any software
implementation of Worley noise hands down.

link:
[1] https://github.com/stegu/webgl-noise/blob/master/src/cellular3D.glsl
[2] https://www.shadertoy.com/view/Xsd3Wr
*/

#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

uniform sampler2D u_tex0;

float mouseMoving = 0.0;

float rand(vec2 n) { 
    	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 n) {
    	const vec2 d = vec2(0.0, 1.0);
  	vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    	return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

const mat2 m2 = mat2(0.8,-0.6,0.6,0.8);
float fbm( in vec2 p ){
    	float f = 0.0;
    	f += 0.5000*noise( p ); p = m2*p*2.02;
    	f += 0.2500*noise( p ); p = m2*p*2.03;
    	f += 0.1250*noise( p ); p = m2*p*2.01;
    	f += 0.0625*noise( p );

    	return f/0.9375;
}

// Permutation polynomial: (34x^2 + x) mod 289
vec3 permute(vec3 x) {
  	return mod((34.0 * x + 1.0) * x, 289.0);
}

vec2 cellular(vec3 P) {
#define K 0.142857142857 // 1/7
#define Ko 0.428571428571 // 1/2-K/2
#define K2 0.020408163265306 // 1/(7*7)
#define Kz 0.166666666667 // 1/6
#define Kzo 0.416666666667 // 1/2-1/6*2
#define jitter 1.0 // smaller jitter gives more regular pattern // new 1229

	vec3 Pi = mod(floor(P), 289.0);
 	vec3 Pf = fract(P) - 0.5;

	vec3 Pfx = Pf.x + vec3(1.0, 0.0, -1.0);
	vec3 Pfy = Pf.y + vec3(1.0, 0.0, -1.0);
	vec3 Pfz = Pf.z + vec3(1.0, 0.0, -1.0);

	vec3 p = permute(Pi.x + vec3(-1.0, 0.0, 1.0));
	vec3 p1 = permute(p + Pi.y - 1.0);
	vec3 p2 = permute(p + Pi.y);
	vec3 p3 = permute(p + Pi.y + 1.0);

	vec3 p11 = permute(p1 + Pi.z - 1.0);
	vec3 p12 = permute(p1 + Pi.z);
	vec3 p13 = permute(p1 + Pi.z + 1.0);

	vec3 p21 = permute(p2 + Pi.z - 1.0);
	vec3 p22 = permute(p2 + Pi.z);
	vec3 p23 = permute(p2 + Pi.z + 1.0);

	vec3 p31 = permute(p3 + Pi.z - 1.0);
	vec3 p32 = permute(p3 + Pi.z);
	vec3 p33 = permute(p3 + Pi.z + 1.0);

	vec3 ox11 = fract(p11*K) - Ko;
	vec3 oy11 = mod(floor(p11*K), 7.0)*K - Ko;
	vec3 oz11 = floor(p11*K2)*Kz - Kzo; // p11 < 289 guaranteed

	vec3 ox12 = fract(p12*K) - Ko;
	vec3 oy12 = mod(floor(p12*K), 7.0)*K - Ko;
	vec3 oz12 = floor(p12*K2)*Kz - Kzo;

	vec3 ox13 = fract(p13*K) - Ko;
	vec3 oy13 = mod(floor(p13*K), 7.0)*K - Ko;
	vec3 oz13 = floor(p13*K2)*Kz - Kzo;

	vec3 ox21 = fract(p21*K) - Ko;
	vec3 oy21 = mod(floor(p21*K), 7.0)*K - Ko;
	vec3 oz21 = floor(p21*K2)*Kz - Kzo;

	vec3 ox22 = fract(p22*K) - Ko;
	vec3 oy22 = mod(floor(p22*K), 7.0)*K - Ko;
	vec3 oz22 = floor(p22*K2)*Kz - Kzo;

	vec3 ox23 = fract(p23*K) - Ko;
	vec3 oy23 = mod(floor(p23*K), 7.0)*K - Ko;
	vec3 oz23 = floor(p23*K2)*Kz - Kzo;

	vec3 ox31 = fract(p31*K) - Ko;
	vec3 oy31 = mod(floor(p31*K), 7.0)*K - Ko;
	vec3 oz31 = floor(p31*K2)*Kz - Kzo;

	vec3 ox32 = fract(p32*K) - Ko;
	vec3 oy32 = mod(floor(p32*K), 7.0)*K - Ko;
	vec3 oz32 = floor(p32*K2)*Kz - Kzo;

	vec3 ox33 = fract(p33*K) - Ko;
	vec3 oy33 = mod(floor(p33*K), 7.0)*K - Ko;
	vec3 oz33 = floor(p33*K2)*Kz - Kzo;

	vec3 dx11 = Pfx + jitter*ox11;
	vec3 dy11 = Pfy.x + jitter*oy11;
	vec3 dz11 = Pfz.x + jitter*oz11;

	vec3 dx12 = Pfx + jitter*ox12;
	vec3 dy12 = Pfy.x + jitter*oy12;
	vec3 dz12 = Pfz.y + jitter*oz12;

	vec3 dx13 = Pfx + jitter*ox13;
	vec3 dy13 = Pfy.x + jitter*oy13;
	vec3 dz13 = Pfz.z + jitter*oz13;

	vec3 dx21 = Pfx + jitter*ox21;
	vec3 dy21 = Pfy.y + jitter*oy21;
	vec3 dz21 = Pfz.x + jitter*oz21;

	vec3 dx22 = Pfx + jitter*ox22;
	vec3 dy22 = Pfy.y + jitter*oy22;
	vec3 dz22 = Pfz.y + jitter*oz22;

	vec3 dx23 = Pfx + jitter*ox23;
	vec3 dy23 = Pfy.y + jitter*oy23;
	vec3 dz23 = Pfz.z + jitter*oz23;

	vec3 dx31 = Pfx + jitter*ox31;
	vec3 dy31 = Pfy.z + jitter*oy31;
	vec3 dz31 = Pfz.x + jitter*oz31;

	vec3 dx32 = Pfx + jitter*ox32;
	vec3 dy32 = Pfy.z + jitter*oy32;
	vec3 dz32 = Pfz.y + jitter*oz32;

	vec3 dx33 = Pfx + jitter*ox33;
	vec3 dy33 = Pfy.z + jitter*oy33;
	vec3 dz33 = Pfz.z + jitter*oz33;

	vec3 d11 = dx11 * dx11 + dy11 * dy11 + dz11 * dz11;
	vec3 d12 = dx12 * dx12 + dy12 * dy12 + dz12 * dz12;
	vec3 d13 = dx13 * dx13 + dy13 * dy13 + dz13 * dz13;
	vec3 d21 = dx21 * dx21 + dy21 * dy21 + dz21 * dz21;
	vec3 d22 = dx22 * dx22 + dy22 * dy22 + dz22 * dz22;
	vec3 d23 = dx23 * dx23 + dy23 * dy23 + dz23 * dz23;
	vec3 d31 = dx31 * dx31 + dy31 * dy31 + dz31 * dz31;
	vec3 d32 = dx32 * dx32 + dy32 * dy32 + dz32 * dz32;
	vec3 d33 = dx33 * dx33 + dy33 * dy33 + dz33 * dz33;

	// Sort out the two smallest distances (F1, F2)
#if 0
	// Cheat and sort out only F1
	vec3 d1 = min(min(d11,d12), d13);
	vec3 d2 = min(min(d21,d22), d23);
	vec3 d3 = min(min(d31,d32), d33);
	vec3 d = min(min(d1,d2), d3);
	d.x = min(min(d.x,d.y),d.z);
	return sqrt(d.xx); // F1 duplicated, no F2 computed
#else
	// Do it right and sort out both F1 and F2
	vec3 d1a = min(d11, d12);
	d12 = max(d11, d12);
	d11 = min(d1a, d13); // Smallest now not in d12 or d13
	d13 = max(d1a, d13);
	d12 = min(d12, d13); // 2nd smallest now not in d13
	vec3 d2a = min(d21, d22);
	d22 = max(d21, d22);
	d21 = min(d2a, d23); // Smallest now not in d22 or d23
	d23 = max(d2a, d23);
	d22 = min(d22, d23); // 2nd smallest now not in d23
	vec3 d3a = min(d31, d32);
	d32 = max(d31, d32);
	d31 = min(d3a, d33); // Smallest now not in d32 or d33
	d33 = max(d3a, d33);
	d32 = min(d32, d33); // 2nd smallest now not in d33
	vec3 da = min(d11, d21);
	d21 = max(d11, d21);
	d11 = min(da, d31); // Smallest now in d11
	d31 = max(da, d31); // 2nd smallest now not in d31
	d11.xy = (d11.x < d11.y) ? d11.xy : d11.yx;
	d11.xz = (d11.x < d11.z) ? d11.xz : d11.zx; // d11.x now smallest
	d12 = min(d12, d21); // 2nd smallest now not in d21
	d12 = min(d12, d22); // nor in d22
	d12 = min(d12, d31); // nor in d31
	d12 = min(d12, d32); // nor in d32
	d11.yz = min(d11.yz,d12.xy); // nor in d12.yz
	d11.y = min(d11.y,d12.z); // Only two more to go
	d11.y = min(d11.y,d11.z); // Done! (Phew!)
	return sqrt(d11.xy); // F1, F2
#endif
}

float getDepth(vec2 pos, vec2 uv) {
	vec2 cellSmall = cellular(vec3(pos, u_time * mouseMoving * .04));

	float facets = cellSmall.y;
    	float depth = .2 + 1. - facets;
    	depth = pow(depth, 2.);
    	depth += fbm(pos * 10.) * .1;
    	//depth *= (.7 + pow(length(sin(pos * .5)), 4.) * .3) * pow(length(uv * .6 + .4), 5.);
    	return depth;
}

vec4 getBump (vec2 pos, vec2 uv) {
    	vec2 size = vec2(2.0,0.0);
    	vec3 off = vec3(-1,0,1);
    	size *= .02; 
    	off *= .05;
    
    	float s11 = getDepth(pos, uv);
    	float s01 = getDepth(pos + off.xy, uv);
    	float s21 = getDepth(pos + off.zy, uv);
    	float s10 = getDepth(pos + off.yx, uv);
    	float s12 = getDepth(pos + off.yz, uv);
    	vec3 va = normalize(vec3(size.xy,s21-s01));
    	vec3 vb = normalize(vec3(size.yx,s12-s10));
    	vec4 bump = vec4( cross(va,vb), s11 );
    	return bump;
}

float breathing=(exp(sin(u_time*2.0*3.14159/16.0)) + 0.36787944/5.)*0.42545906412;
float mouseEffect(vec2 uv, vec2 mouse, float size)
{
    	float dist=length(uv-mouse);
	return smoothstep(size*0.8, size+2.25*(0.8), dist);
}
 
void main(void)
{
	// uv & mouse -> 1:1, center
	vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    	vec2 st = uv; // for tex0: img
    	uv = uv * 2.0 - 1.0;
    	uv.x *= u_resolution.x / u_resolution.y;
	// ---
	vec2 mouse = u_mouse.xy / u_resolution.xy;
    	mouse = mouse * 2.0 - 1.0;
    	mouse.x *= u_resolution.x / u_resolution.y;

	// detect mouse is moving or not
	if((mouse.x > -1.8 && mouse.x < 1.8) && (mouse.y > -0.95 && mouse.y < 0.95))
	{
		mouseMoving = 1.0;
	}
	else 
	{
		mouseMoving = 0.0;
	}

	// noise
    	vec2 pos = uv * 2.8 + (noise(u_mouse.xy)*5. / u_resolution.xy);
    
	// bump map
	vec4 bump = getBump(pos, uv);
    
	// texture
    	vec4 shadeColor= texture2D(u_tex0, st);

	// color
	vec3 color = vec3(noise(bump.yz * 2. - 1.));
    	color += pow(dot(bump.xyz, vec3(1.)), 1.) * .3;
    	color *= .9 + (.7 + pow(length(sin(pos * .5)), 4.) * .3) * pow(length(uv * .6 + .4), 5.) * .2;

	// mouse
	float value = mouseEffect(uv, mouse, 0.01);

	if(mouseMoving == 1.0)
	{
		color = vec3(shadeColor)*0.8 * vec3(0.607,0.848,0.900) + 0.8 * color * breathing + value * 0.6;
	}
	else 
	{
		color = shadeColor.b*vec3(0.607,0.848,0.900) + 0.5 * color.b;
	}

	gl_FragColor = vec4(color, bump.w * .8);
}
