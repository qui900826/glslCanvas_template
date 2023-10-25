// Author: CY
// Title: MoonLight -20231025

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

//Gradient Noise
vec2 hash2(vec2 x) //亂數範圍 [-1,1]
{
    const vec2 k = vec2(0.3183099, 0.3678794);
    x = x * k + k.yx;
    return -1.0 + 2.0 * fract(16.0 * k * fract(x.x * x.y * (x.x + x.y)));
}

float gnoise(in vec2 p) //亂數範圍 [-1,1]
{
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)), dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x), mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}

float noise(in vec2 p) //亂數範圍 [-1,1]
{
        #ifdef Use_Perlin    
    return gnoise(p); //gradient noise
        #elif defined Use_Value
    return vnoise(p); //value noise
        #endif    
    return 0.0;
}

float fbm(in vec2 uv) //亂數範圍 [-1,1]
{
    float f; //fbm - fractal noise (4 octaves)
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    f = 0.5000 * gnoise(uv);
    uv = m * uv;
    f += 0.2500 * gnoise(uv);
    uv = m * uv;
    f += 0.1250 * gnoise(uv);
    uv = m * uv;
    f += 0.0625 * gnoise(uv);
    uv = m * uv;
    return f;
}

void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x *= u_resolution.x / u_resolution.y;
    uv = uv * 2.0 - 1.0;
    
    //陰晴圓缺
    float pi = 3.14159;
    float theta = 2.0 * pi * u_time / 8.0;
    vec2 point = vec2(sin(theta), cos(theta));
    float dir = dot(point, (uv)) + 0.55;

    //亂數作用雲霧
    float fog = fbm(0.4 * uv + vec2(-0.1 * u_time, -0.02 * u_time)) * 0.6 + 0.1;

    // 定義光環
    float dist = length(uv);
    float circle_dist = abs(dist - 0.368); // 光環大小


    // 動態呼吸
    // float breathing = sin(u_time * 2.0 * pi / 8.0) * 0.5 + 0.5; // option1
    // float breathing = (exp(sin(u_time / 2.0 * pi)) - 0.36787944) * 108.0; // apple original breath function
    float breathing = (exp(sin(u_time / 2.0 * pi)) - 0.36787944) * 0.3; // option2
    float strength = (0.2 * breathing * dist + 0.276);			//[0.2~0.3]			//光暈強度加上動態時間營造呼吸感
    // float strength = (0.2 * breathing + 0.180); // [0.2~0.3] //光暈強度加上動態時間營造呼吸感
    float thickness = (0.1 * breathing + 0.028); // [0.1~0.2] //光環厚度加上動態時間營造呼吸感
    float glow_circle = glow(circle_dist, strength, thickness);

    gl_FragColor = vec4((vec3(glow_circle) + fog) * dir * vec3(0.776, 0.772, 1.000), 1.0);
}
