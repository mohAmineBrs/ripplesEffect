uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform sampler2D uTitle;


uniform float uTime;
uniform float uProgress;

varying vec2 vUv;

float PI = 3.141592653589793238;

void main() {
  vec4 displacement = texture2D(uDisplacement, vUv);

  float theta = displacement.r * 2. * PI;     // Angle Between 0 an 2PI
  vec2 direction = vec2(sin(theta), cos(theta));
  vec2 newUv = vUv + direction * displacement.r * 0.1;

  vec4 color = texture2D(uTexture, newUv);

  float grayScale = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  // float grayScale = dot(color.rgb, vec3(0.));

  vec3 pixi = mix(vec3(grayScale), color.rgb, theta / (2. * PI));
  
  gl_FragColor = vec4(pixi, 1.0);


}

