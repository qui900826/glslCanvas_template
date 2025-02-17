// Author: qui900826
// Title: MoonLight

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float glow(float d, float str, float thickness)
{
    return thickness / pow(d, str);
}

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 6
float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}

void main() 
{
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x *= u_resolution.x / u_resolution.y;
    uv = uv * 2.0 - 1.0;

    float pi = 3.14159;
    // float info = hash2(uv*200.0).x; // *200 no problem
    
    float fog = fbm(uv + u_time * vec2(0.1, sin(0.05*u_time)/400.0));

    // 定義光環
    float dist = length(uv);
    float circle_dist = abs(dist - 0.248); // 光環大小
    
    // 動態呼吸
    // float breathing = sin(u_time * 2.0 * pi / 8.0) * 0.5 + 0.5; // option1
    // float breathing = (exp(sin(u_time / 2.0 * pi)) - 0.36787944) * 108.0; // apple original breath function
    float breathing = (exp(sin(u_time / 2.0 * pi)) - 0.36787944) * 0.3; // option2
    float strength = (0.2 * breathing * dist + 0.276);			//[0.2~0.3]			//光暈強度加上動態時間營造呼吸感
    // float strength = (0.2 * breathing + 0.180); // [0.2~0.3] //光暈強度加上動態時間營造呼吸感
    float thickness = (0.1 * breathing + 0.028); // [0.1~0.2] //光環厚度加上動態時間營造呼吸感
    float glow_circle = glow(circle_dist, strength, thickness);
    gl_FragColor = vec4(vec3(glow_circle+fog*0.092) * vec3(0.776,0.772,1.000), 1.0);
    // gl_FragColor = vec4(vec3(info), 1.0);
}

// // Author:CMH
// // Title:BreathingGlow
// #ifdef GL_ES
// precision mediump float;
// #endif

// uniform vec2 u_resolution;
// uniform vec2 u_mouse;
// uniform float u_time;

// float glow(float d, float str, float thickness){
//     return thickness / pow(d, str);
// }

// void main() {
//     vec2 uv = gl_FragCoord.xy/u_resolution.xy;
//     uv.x *= u_resolution.x/u_resolution.y;
//     uv= uv*2.0-1.0;

//     float pi=3.14159;

//     //定義圓環
//     float dist = length(uv);
//     float circle_dist = abs(dist-0.512);								//光環大小
    
//     //動態呼吸
//     float breathing=sin(u_time*2.0*pi/4.0)*0.5+0.5;						//option1
//     //float breathing=(exp(sin(u_time/2.0*pi)) - 0.36787944)*0.42545906412; 			//option2 正確
//     //float strength =(0.2*breathing*dir+0.180);			//[0.2~0.3]			//光暈強度加上動態時間營造呼吸感
//     float strength =(0.2*breathing+0.180);			//[0.2~0.3]			//光暈強度加上動態時間營造呼吸感
//     float thickness=(0.1*breathing+0.084);			//[0.1~0.2]			//光環厚度 營造呼吸感
//     float glow_circle = glow(circle_dist, strength, thickness);
//     gl_FragColor = vec4(vec3(glow_circle)*vec3(1.0, 0.5, 0.25),1.0);
// }

/*
// Author:CMH
// Title:BreathingGlow+noise

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float glow(float d, float str, float thickness){
    return thickness / pow(d, str);
}

vec2 hash2( vec2 x )            //亂數範圍 [-1,1]
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}
float gnoise( in vec2 p )       //亂數範圍 [-1,1]
{
    vec2 i = floor( p );
    vec2 f = fract( p );
    
    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( hash2( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                            dot( hash2( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                         mix( dot( hash2( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                            dot( hash2( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}
#define Use_Perlin
//#define Use_Value
float noise( in vec2 p )        //亂數範圍 [-1,1]
{
#ifdef Use_Perlin    
return gnoise(p);   //gradient noise
#elif defined Use_Value
return vnoise(p);       //value noise
#endif    
return 0.0;
}
float fbm(in vec2 uv)       //亂數範圍 [-1,1]
{
    float f;                                                //fbm - fractal noise (4 octaves)
    mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
    f   = 0.5000*noise( uv ); uv = m*uv;          
    f += 0.2500*noise( uv ); uv = m*uv;
    f += 0.1250*noise( uv ); uv = m*uv;
    f += 0.0625*noise( uv ); uv = m*uv;
    return f;
}


void main() {
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    uv.x *= u_resolution.x/u_resolution.y;
    uv= uv*2.0-1.0;
    
    //陰晴圓缺
    float pi=3.14159;
    float theta=2.0*pi*u_time/8.0;
    vec2 point=vec2(sin(theta), cos(theta));
    float dir= dot(point, (uv))+0.55;
    
    //亂數作用雲霧
    float fog= fbm(0.4*uv+vec2(-0.1*u_time, -0.02*u_time))*0.6+0.1;

    //定義圓環
    float dist = length(uv);
    float circle_dist = abs(dist-0.512);                                //光環大小
    
    //動態呼吸
    float breathing=sin(2.0*u_time/5.0*pi)*0.5+0.2;                     //option1
    //float breathing=(exp(sin(u_time/2.0*pi)) - 0.36787944)*0.42545906412;         //option2 錯誤
     //float breathing=(exp(sin(u_time/2.0*pi)) - 0.36787944)*0.42545906412;                //option2 正確
    float strength =(0.2*breathing+0.180);          //[0.2~0.3]         //光暈強度加上動態時間營造呼吸感
    float thickness=(0.1*breathing+0.084);          //[0.1~0.2]         //光環厚度 營造呼吸感
    float glow_circle = glow(circle_dist, strength, thickness);
    gl_FragColor = vec4((vec3(glow_circle)+fog)*dir*vec3(1.0, 0.5, 0.25),1.0);
}
*/








