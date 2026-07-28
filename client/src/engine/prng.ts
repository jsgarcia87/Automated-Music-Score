// Generador de números aleatorios con semilla determinista (Mulberry32)

export class SeededPRNG {
  private state: number;
  public readonly seedString: string;

  constructor(seed?: string) {
    this.seedString = seed && seed.trim() !== '' ? seed : SeededPRNG.generateRandomSeed();
    this.state = this.hashString(this.seedString);
  }

  // Convierte string a entero inicial de 32 bits (cyrb53/hash simple)
  private hashString(str: string): number {
    let hash = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      hash = Math.imul(hash ^ str.charCodeAt(i), 3432918353);
      hash = (hash << 13) | (hash >>> 19);
    }
    return hash >>> 0;
  }

  // Genera número aleatorio entre [0, 1) determinista por semilla
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Número entero en rango [min, max] (inclusivo)
  public rangeInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Número flotante en rango [min, max)
  public rangeFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  // Seleccionar elemento aleatorio de un array
  public choice<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error('No se puede seleccionar elemento de un array vacío');
    }
    const idx = this.rangeInt(0, array.length - 1);
    return array[idx];
  }

  // Booleano con probabilidad (por defecto 50%)
  public chance(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  // Generador estático de semillas alfanuméricas memorables o cortas
  public static generateRandomSeed(): string {
    const prefixes = ['Allegro', 'Cadenza', 'Sonata', 'Adagio', 'Scherzo', 'Fugue', 'Chopin', 'Bach', 'Rondo', 'Opus'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${num}`;
  }
}
