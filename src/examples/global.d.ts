/// <reference types="three" />
/// <reference types="characters/Character" />
/// <reference types="three/examples/jsm/loaders/GLTFLoader" />
import { GLTF as GLTFLoaderType } from 'three/examples/jsm/loaders/GLTFLoader';
import { Character } from 'characters/Character';
// Declare globals if needed
declare global {
  interface GLTF extends GLTFLoaderType {}
  
  class Character extends Character {}
}