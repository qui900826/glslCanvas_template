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

float fbm(in vec2 uv)       //亂數範圍 [-1,1]
{
    float f;                                                //fbm - fractal noise (4 octaves)
    mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
    f   = 0.5000*gnoise( uv ); uv = m*uv;          
    f += 0.2500*gnoise( uv ); uv = m*uv;
    f += 0.1250*gnoise( uv ); uv = m*uv;
    f += 0.0625*gnoise( uv ); uv = m*uv;
    return f;
}

//Gradient Noise 3D
vec3 hash( vec3 p ) // replace this by something better
{
    p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
              dot(p,vec3(269.5,183.3,246.1)),
              dot(p,vec3(113.5,271.9,124.6)));

    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec3 p )
{
    vec3 i = floor( p );
    vec3 f = fract( p );
    
    vec3 u = f*f*(3.0-2.0*f);

    return mix( mix( mix( dot( hash( i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ), 
                          dot( hash( i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ), 
                          dot( hash( i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
                mix( mix( dot( hash( i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ), 
                          dot( hash( i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
                     mix( dot( hash( i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ), 
                          dot( hash( i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z );
}

float sdEgg( in vec2 p, in float ra, in float rb )
{
    const float k = sqrt(3.0);
    p.x = abs(p.x);
    float r = ra - rb;
    return ((p.y<0.0)       ? length(vec2(p.x,  p.y    )) - r :
            (k*(p.x+r)<p.y) ? length(vec2(p.x,  p.y-k*r)) :
                              length(vec2(p.x+r,p.y    )) - 2.0*r) - rb;
}

float mouseEffect(vec2 uv, vec2 mouse, float size)
{
    float dist=length(uv-mouse);
    return 1.2-smoothstep(size*1.9, size, dist);  //size
    //return pow(dist, 0.5);
}

void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x *= u_resolution.x / u_resolution.y;
    uv = uv * 2.0 - 1.0;
    
    vec2 mouse=u_mouse/u_resolution.xy;
    mouse.x*= u_resolution.x/u_resolution.y;
    mouse=mouse*2.0-1.0;
    
    //陰晴圓缺
    float pi = 3.14159;
    float theta = 2.0 * pi * u_time / 8.0;
    vec2 point = vec2(sin(theta), cos(theta));
    float dir = dot(point, (uv)) + 0.55;
    
    //互動陰晴圓缺
    float interact=1.-mouseEffect(uv,mouse,0.35);

    //亂數作用雲霧
    float fog = fbm(0.4 * uv + vec2(-0.1 * u_time, -0.02 * u_time)) * 0.6 + 0.1;

    // 定義光環
    // float weight = smoothstep(0.216, 0.368, uv.y);
    // float noise = gnoise(uv*5.019)*0.04*weight;
    // float dist = length(uv) + noise;
    // float circle_dist = abs(dist - 0.368); // 光環大小
    
    float result;
    
    for(float i = 0.; i<18.; i++)
    {
        
        
        // 動態呼吸
        // float breathing = sin(u_time * 2.0 * pi / 8.0) * 0.5 + 0.5; // option1
        // float breathing = (exp(sin(u_time / 2.0 * pi)) - 0.36787944) * 108.0; // apple original breath function
        float breathing = (exp(sin(u_time / 2.0 * pi)) - 0.864) * 0.3; // option2
        float strength = (0.01 * breathing + 0.3); //[0.2~0.3]			//光暈強度加上動態時間營造呼吸感
        // float strength = (0.2 * breathing + 0.180); // [0.2~0.3] //光暈強度加上動態時間營造呼吸感
        float thickness = (0.005 * breathing + 0.01); // [0.1~0.2] //光環厚度加上動態時間營造呼吸感
        // float glow_circle = glow(circle_dist, strength, thickness);
        
        float weight = smoothstep(-0.648, 1.652, -uv.y)*3.008*dir;
        float freq = 1.208+i*-0.512 ;
    	// float noise = gnoise(uv*1.355*freq)*weight*0.5*breathing; //*abs(sin(u_time/6.))
        // float noise = gnoise(uv*freq)*-0.024*weight;
        float noise_position= interact;
    	float radius_noise=noise(vec3(4.892*uv,i+u_time*0.388))*0.280*noise_position;
        // model
        float model_dist = abs(sdEgg(uv, 0.344, 0.288) + radius_noise*1.3);
        
        float glow_circle = glow(model_dist, strength, thickness);
        result += glow_circle;
    }

    gl_FragColor = vec4((vec3(result) + fog) * vec3(0.776, 0.772, 1.000), 1.0);
}
