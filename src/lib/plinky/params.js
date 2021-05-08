// This is a list of the params in a Plinky patch, in this order.
// The order is therefore important. The list is from params_new.h in the Plinky fw.
// It is used to translate the TypedArray that we get from the device into JSON.
export const EParams = [
  "P_PWM",
  "P_DRIVE",
  "P_PITCH",
  "P_OCT",
  "P_GLIDE",
  "P_INTERVAL",
  "P_NOISE",
  "P_MIXRESO",
  "P_ROTATE",
  "P_SCALE",
  "P_MICROTUNE",
  "P_STRIDE",
  "P_SENS",
  "P_A",
  "P_D",
  "P_S",
  "P_R",
  "P_ENV1_UNUSED",
  "P_ENV_LEVEL1",
  "P_A2",
  "P_D2",
  "P_S2",
  "P_R2",
  "P_ENV2_UNUSED",
  "P_DLSEND",
  "P_DLTIME",
  "P_DLRATIO",
  "P_DLWOB",
  "P_DLFB",
  "P_TEMPO",
  "P_RVSEND",
  "P_RVTIME",
  "P_RVSHIM",
  "P_RVWOB",
  "P_RVUNUSED",
  "P_SWING",
  "P_ARPONOFF",
  "P_ARPMODE",
  "P_ARPDIV",
  "P_ARPPROB",
  "P_ARPLEN",
  "P_ARPOCT",
  "P_LATCHONOFF",
  "P_SEQMODE",
  "P_SEQDIV",
  "P_SEQPROB",
  "P_SEQLEN",
  "P_GATE_LENGTH",
  "P_SMP_POS",
  "P_SMP_GRAINSIZE",
  "P_SMP_RATE",
  "P_SMP_TIME",
  "P_SAMPLE",
  "P_SEQPAT",
  "P_JIT_POS",
  "P_JIT_GRAINSIZE",
  "P_JIT_RATE",
  "P_JIT_PULSE",
  "P_JIT_UNUSED",
  "P_SEQSTEP",
  "P_ASCALE",
  "P_AOFFSET",
  "P_ADEPTH",
  "P_AFREQ",
  "P_ASHAPE",
  "P_AWARP",
  "P_BSCALE",
  "P_BOFFSET",
  "P_BDEPTH",
  "P_BFREQ",
  "P_BSHAPE",
  "P_BWARP",
  "P_XSCALE",
  "P_XOFFSET",
  "P_XDEPTH",
  "P_XFREQ",
  "P_XSHAPE",
  "P_XWARP",
  "P_YSCALE",
  "P_YOFFSET",
  "P_YDEPTH",
  "P_YFREQ",
  "P_YSHAPE",
  "P_YWARP",
  "P_MIXSYNTH",
  "P_MIXWETDRY",
  "P_MIXHPF",
  "P_MIX_UNUSED",
  "P_CV_QUANT",
  "P_HEADPHONE",
  "P_MIXINPUT",
  "P_MIXINWETDRY",
  "P_SYS_UNUSED1",
  "P_SYS_UNUSED2",
  "P_SYS_UNUSED3",
  "P_ACCEL_SENS",
];

export const PatchCategories = [
  "",
  "Bass",
  "Leads",
  "Pads",
  "Arps",
  "Plinks",
  "Plonks",
  "Beeps",
  "Boops",
  "SFX",
  "Line-In",
  "Sampler",
  "Donk",
  "Jolly",
  "Sadness",
  "Wild",
  "Gnarly",
  "Weird",
];

export const PlinkyParams = [
  {
    "id": "P_PWM",
    "min": -100,
    "max": 100,
    "type": "int16",
    "offset": 0,
    "cc": 13,
    "name": "Shape",
    "description": "Controls the shape of the oscillators in Plinky. When exactly 0%, you get 4 sawtooths per voice. When positive, you blend smoothly through 16 ROM wavetable shapes, (2 per voice,) provided by @miunau. When negative, you get PWM control of pulse/square shapes, (also 2 per voice.) CV and internal modulation only work either positive or negative: you can blend through the wavetables when the parameter is over 0, or you can modulate pulse/square waves when the value is negative. You cant cross through zero. Plinky pans each set of oscillators, (and the sample grains) a little giving the sound a rich stereo field. With the 4 saws at position 0, we have 2 oscilators panned left and 2 panned right. With the wavetable and pulse oscilators 1 is panned left and 1 is panned right."
  },
  {
    "id": "P_DRIVE",
    "min": -1024,
    "max": 1024,
    "cc": 4,
    "name":"Drive",
    "description": "Drive/Saturation. When turned up high, the saturation unit will create guitar-like tones, especially when playing polyphonically. It can also be used to compensate for changes in volume, for example if the Sensitivity parameter is low."
  },
  {
    "id": "P_PITCH",
    "min": -1024,
    "max": 1024,
    "cc": 9,
    "name": "Pitch",
    "description": "Use this to (fine) tune plinky. Range is 1 octave up or down, unquantized."
  },
  {
    "id": "P_OCT",
    "min": -1024,
    "max": 1024,
    "cc": -1,
    "name": "Octave",
    "description": "Use this to quickly change pitch, quantised to octaves."
  },
  {
    "id": "P_GLIDE",
    "min": 0,
    "max": 127,
    "cc": 5,
    "name": "Glide",
    "description": "Controls the speed of the portamento between notes in a single voice. Higher = slower"
  },
  {
    "id": "P_INTERVAL",
    "min": 0,
    "max": 127,
    "cc": 14,
    "name": "Interval",
    "description": "Each voice has several oscillators, and this sets a fixed interval between them, from +1 to -1 octaves."
  },
  {
    "id": "P_NOISE",
    "min": -127,
    "max": 127,
    "cc": 2,
    "name": "Noise",
    "description": "Each voice can add a variable amount of white noise to the oscillator, before the low-pass gate."
  },
  {
    "id": "P_MIXRESO",
    "min": 0,
    "max": 127,
    "cc": 71,
    "name": "Resonance",
    "description": "Each voice has a 2-pole lowpass gate controlled by your finger pressure and the Sensitivity control. This parameter adds resonance to the filter. Note that at high levels of resonance, you may wish to adjust the drive or the high pass filter paramters."
  },
  {
    "id": "P_ROTATE",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "Degree",
    "description": "Think of this as a quantized pitch control, that transposes plinky in such a way that all the notes stay in the same scale. In other words, it changes which degree of the scale is played, but not the root of the scale itself."
  },
  {
    "id": "P_SCALE",
    "min": 0,
    "max": 26,
    "cc": -1,
    "name": "Scale",
    "enum_id": [
        "S_MAJOR",			
        "S_MINOR",			
        "S_HARMMINOR",		
        "S_PENTA",			
        "S_PENTAMINOR",		
        "S_HIRAJOSHI",		
        "S_INSEN",			
        "S_IWATO",			
        "S_MINYO",			
        "S_FIFTHS",			
        "S_TRIADMAJOR",		
        "S_TRIADMINOR",		
        "S_DORIAN",		
        "S_PHYRGIAN",		
        "S_LYDIAN",			
        "S_MIXOLYDIAN",		
        "S_AEOLIAN",		
        "S_LOCRIAN",			
        "S_BLUESMINOR",		
        "S_BLUESMAJOR",		
        "S_ROMANIAN",		
        "S_WHOLETONE",		
        "S_HARMONICS",
        "S_HEXANY", 
        "S_JUST",
        "S_CHROMATIC",
        "S_LAST"
    ],
    "enum_name": [
        "Major",
        "Minor",
        "Harminoc Min",
        "Penta Maj",
        "Penta Min",
        "Hirajoshi",
        "Insen",
        "Iwato",
        "Minyo",
        "Fifths",
        "Triad Maj",
        "Triad Min",
        "Dorian",
        "Phrygian",
        "Lydian",
        "Mixolydian",
        "Aeolian",
        "Locrian",
        "Blues Min",
        "Blues Maj",
        "Romanian",
        "Wholetone",
        "Harmonics",
        "Hexany",
        "Just",
        "Chromatic"
    ],
    "description": "Selects which scale of notes plinky uses"
  },
  {
    "id": "P_MICROTUNE",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "Microtune",
    "description": "Controls how much vertical movement of your finger detunes the note. This also thickens the sound through 'unison' detuning of the individual oscillators in each note, so values above 0 are recommended."
  },
  {
    "id": "P_STRIDE",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "Stride",
    "description": "Controls the interval, in semitones, between each column of plinky. It defaults to 7 semitones, a perfect fifth, like a Cello or Violin. The notes are always snapped to the chosen scale, even if the stride calls for chromatic notes, so plinky does its best to choose column pitches that follow this stride while staying in-scale."
  },
  {
    "id": "P_SENS",
    "min": 0,
    "max": 1,
    "default": 0.5,
    "cc": 3,
    "name": "Sensitivity",
    "description": "Master sensitivty, controlling the mapping of finger pressure to the opening/closing of each voice's low-pass gate. If you are looking for a lowpass cutoff frequency, this is the parameter you want."
  },
  {
    "id": "P_A",
    "min": 0,
    "max": 127,
    "cc": 73,
    "name": "Attack",
    "description": "Attack time for the main envelope that controls the lowpass gate. The peak level is set by the pressure of your finger, modulated by the Sensitivity parameter."
  },
  {
    "id": "P_D",
    "min": 0,
    "max": 127,
    "cc": 75,
    "name": "Decay",
    "description": "Decay time for the main envelope that controls the lowpass gate."
  },
  {
    "id": "P_S",
    "min": 0,
    "max": 127,
    "cc": 74,
    "name": "Sustain",
    "description": "Sustain level for the main envelope that controls the lowpass gate."
  },
  {
    "id": "P_R",
    "min": 0,
    "max": 127,
    "cc": 72,
    "name": "Release",
    "description": "Release time for the main envelope that controls the lowpass gate."
  },
  {
    "id": "P_ENV_LEVEL1",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "Envelope 1 level",
    "description": "Envelope 1 level"
  },
  {
    "id": "P_ENV_LEVEL",
    "min": 0,
    "max": 127,
    "cc": 19,
    "name": "Env 2 Level",
    "description": "Sets the peak level of the second envelope, which can be used as a modulation source."
  },
  {
    "id": "P_A2",
    "min": 0,
    "max": 127,
    "cc": 20,
    "name": "Attack 2",
    "description": "Attack time of the second envelope, which can be used as a modulation source."
  },
  {
    "id": "P_D2",
    "min": 0,
    "max": 127,
    "cc": 21,
    "name": "Decay 2",
    "description": "Decay time of the second envelope, which can be used as a modulation source."
  },
  {
    "id": "P_S2",
    "min": 0,
    "max": 127,
    "cc": 22,
    "name": "Sustain 2",
    "description": "Sustain level of the second envelope, which can be used as a modulation source."
  },
  {
    "id": "P_R2",
    "min": 0,
    "max": 127,
    "cc": 23,
    "name": "Release 2",
    "description": "Release time of the second envelope, which can be used as a modulation source."
  },
  {
    "id": "P_ENV2_UNUSED",
    "min": 0,
    "max": 127,
    "cc": -1,
    "description": "unused parameter slot"
  },
  {
    "id": "P_DLSEND",
    "min": 0,
    "max": 1,
    "default": 0,
    "cc": 94,
    "name": "Delay Send",
    "description": "Amount of the dry sound sent to the delay unit. Turn it up for echos!"
  },
  {
    "id": "P_DLTIME",
    "min": -1,
    "max": 1,
    "default": 0.375,
    "cc": 12,
    "name": "Delay Time",
    "description": "The time between each echo. Positive values are un-quantized; negative values are multiples of the current tempo."
  },
  {
    "id": "P_DLRATIO",
    "min": 0,
    "max": 1,
    "default": 1,
    "cc": -1,
    "name": "Delay Ratio",
    "description": "The delay unit is stereo. This moves the right tap to an earlier time, causing ping-pong poly-rhthmic repeats. Try simple ratios like 33%, 50%, 75%."
  },
  {
    "id": "P_DLWOB",
    "min": 0,
    "max": 1,
    "default": 0.25,
    "name": "Delay Wobble",
    "cc": -1,
    "description": "Amount of simulated tape speed wobble, causing pitch distortions in the delay."
  },
  {
    "id": "P_DLFB",
    "min": 0,
    "max": 1,
    "default": 0.5,
    "name": "Delay Feedback",
    "cc": 95,
    "description": "Amount of feedback - the volume of each echo reduces by this amount."
  },
  {
    "id": "P_TEMPO",
    "min": -1,
    "max": 1,
    "name": "BPM",
    "remap": "120*Math.pow(2,x)",
    "default": 0,
    "cc": -1,
    "description": "Tempo in BPM. You can also tap this parameter pad rhythmically to set the tempo."
  },
  {
    "id": "P_RVSEND",
    "min": 0,
    "max": 1,
    "name": "Reverb Send",
    "default": 0.25,
    "cc": 91,
    "description": "Amount of the dry sound sent to the reverb unit. Turn it up for reverb!"
  },
  {
    "id": "P_RVTIME",
    "min": 0,
    "max": 1,
    "default": 0.5,
    "name": "Reverb Time",
    "cc": 92,
    "description": "Reverb time. controls the length of the decay of the reverb."
  },
  {
    "id": "P_RVSHIM",
    "min": 0,
    "max": 1,
    "default": 0.25,
    "name": "Shimmer",
    "cc": 93,
    "description": "Amount of octave-up signal that is fed into the reverb, causing a shimmer effect."
  },
  {
    "id": "P_RVWOB",
    "min": 0,
    "max": 1,
    "default": 0.25,
    "name": "Reverb Wobble",
    "cc": -1,
    "description": "Amount of simulated tape speed wobble, causing pitch distortions in the reverb. Avoids metallic artefacts."
  },
  {
    "id": "P_RVUNUSED",
    "min": 0,
    "max": 1,
    "cc": -1,
    "description": "unused parameter slot"
  },
  {
    "id": "P_SWING",
    "min": 0,
    "max": 1,
    "cc": -1,
    "name": "Swing",
    "description": "OUT OF ORDER. This parameter will be used to add swing in a future firmware update"
  },
  {
    "id": "P_ARPONOFF",
    "min": 0,
    "max": 1,
    "cc": 102,
    "default": 0,
    "name": "Arp on/off",
    "description": "Switches the arpeggiator on and off."
  },
  {
    "id": "P_ARPMODE",
    "cc": 103,
    "default": 0,
    "min": 0,
    "max": 15,
    "name": "Arpeggiator Mode",
    "enum_id": [
      "ARP_UP",
      "ARP_DOWN",
      "ARP_UPDOWN",
      "ARP_UPDOWNREP",
      "ARP_PEDALUP",
      "ARP_PEDALDOWN",
      "ARP_PEDALUPDOWN",
      "ARP_RANDOM",
      "ARP_RANDOM2",
      "ARP_ALL",
      "ARP_UP8",
      "ARP_DOWN8",
      "ARP_UPDOWN8",
      "ARP_RANDOM8",
      "ARP_RANDOM28",
      "ARP_LAST"
    ],
    "enum_name": [
      "Up",
      "Down",
      "Up then Down",
      "Up then Down (repeat end notes)",
      "Up with lowest note pedal",
      "Down with lowest note pedal",
      "Up then down with lowest note pedal",
      "Random",
      "Random playing 2 notes at a time",
      "Repeat all notes (polyphonic)",
      "Up (all 8 columns)",
      "Down (all 8 columns)",
      "Up then Down (all 8 columns)",
      "Random (all 8 columns)",
      "Random, 2 notes at a time (all 8 columns)"
    ],
    "description": "Arpeggiator mode. The '8 column' modes include every column, even those without a note, introducing rests into the arpeggio."
  },
  {
    "id": "P_ARPDIV",
    "min": -1,
    "max": 22,
    "default": 0.09090909,
    "name": "Arp Clock Divide",
    "enum_id": [
      "1","2", "3","4","5", "6","8","10", "12","16","20", "24","32","40", "48","64","80", "96","128","160", "192", "256" 
    ],
    "enum_name": [
      "1/32","2/32", "3/32","4/32","5/32", "6/32","8/32","10/32", "12/32","16/32","20/32", "24/32","32/32","40/32", "48/32","64/32","80/32", "96/32","128/32","160/32", "192/32", "256/32" 
    ],
    "cc": -1,
    "description": "Sets the speed of the arpeggiator. Negative numbers are un-quantized, positive numbers divide a 32nd note clock."
  },
  {
    "id": "P_ARPPROB",
    "min": 0,
    "max": 1,
    "default": 1,
    "cc": -1,
    "name": "Arp Probability / Density",
    "description": "Sets the probability of the apreggiator progressing on each tick of its clock. If the Arp Length parameter is 0, this is a true random probability, otherwise it's the density of a Euclidean rhythm."
  },
  {
    "id": "P_ARPLEN",
    "min": -17,
    "max": 17,
    "default": 8,
    "cc": -1,
    "name": "Arp Pattern Length",
    "description": "When non zero, this sets the length of the euclidean pattern used by the arp. Use the Arp probability parameter to change how many note are included in each pattern. Negative values treat rests differently, try both."
  },
  {
    "id": "P_ARPOCT",
    "min": 0,
    "max": 4,
    "default": 0,
    "cc": -1,
    "name": "Arp Octaves",
    "description": "Sets how many octaves the arpeggiator ranges over."
  },
  {
    "id": "P_LATCHONOFF",
    "min": 0,
    "max": 1,
    "name": "Latch on/off",
    "cc": -1,
    "description": "Switches the latch on/off. When on, played notes will sustain even when you take your fingers off plinky. Useful for chords, arps, drones, or using plinky as an oscillator voice."
  },
  {
    "id": "P_SEQMODE",
    "min": 0,
    "max": 6,
    "name": "Sequencer Mode",
    "default": 0,
    "enum_id": [
      "SEQ_PAUSE",
      "SEQ_FWD",
      "SEQ_BACK",
      "SEQ_PINGPONG",
      "SEQ_PINGPONGREP",
      "SEQ_RANDOM",
      "SEQ_LAST"    
    ],
    "enum_name": [
      "Pause",
      "Forwards",
      "Backwards",
      "Pingpong",
      "Pingpong (repeat end notes)",
      "Random"
    ],
    "cc": -1,
    "description": "Sets the order that notes are played by the sequencer."
  },
  {
    "id": "P_SEQDIV",
    "min": 0,
    "max": 22,
    "default": 0.27272727,
    "name": "Seq Clock Divide",
    "enum_id": [
      "1","2", "3","4","5", "6","8","10", "12","16","20", "24","32","40", "48","64","80", "96","128","160", "192", "256" 
    ],
    "enum_name": [
      "1/32","2/32", "3/32","4/32","5/32", "6/32","8/32","10/32", "12/32","16/32","20/32", "24/32","32/32","40/32", "48/32","64/32","80/32", "96/32","128/32","160/32", "192/32", "256/32" 
    ],
    "cc": -1,
    "description": "Sets the speed of the sequencer. Negative numbers are un-quantized, positive numbers divide a 32nd note clock."
  },
  {
    "id": "P_SEQPROB",
    "min": 0,
    "max": 1,
    "default": 1,
    "cc": -1,
    "name": "Seq Probability / Density",
    "description": "Sets the probability of the sequencer progressing on each tick of its clock. If the Arp Length parameter is 0, this is a true random probability, otherwise it's the density of a Euclidean rhythm."
  },
  {
    "id": "P_SEQLEN",
    "min": -17,
    "max": 17,
    "default": 8,
    "cc": -1,
    "name": "Seq Pattern Length",
    "description": "When non zero, this sets the length of the euclidean pattern used by the sequencer. Use the Seq Probability parameter to change how many note are included in each pattern. Negative values treat rests differently, try both."
  },
  {
    "id": "P_GATE_LENGTH",
    "min": 0,
    "max": 127,
    "cc": 11,
    "name": "Gate length",
    "description": "Sets the length of the gate of each step. The gate is the signal that determines whether a note is on or off. Longer gates means notes are played longer, which (in tandem with Envelope 1) determines how long notes are sustained."
  },
  {
    "id": "P_SMP_POS",
    "min": 0,
    "max": 127,
    "cc": 15,
    "name": "Sample position",
    "description": "Controls the starting point of the sample playback, relative to the slice point. If you modulate this parameter you get dynamic slicing."
  },
  {
    "id": "P_SMP_GRAINSIZE",
    "min": 0,
    "max": 127,
    "cc": 16,
    "name": "Grain size",
    "description": "Sets the size of the grains. Modulate to achieve granular sound effects."
  },
  {
    "id": "P_SMP_RATE",
    "min": 0,
    "max": 127,
    "cc": 17,
    "name": "Sample playback rate",
    "description": "Determines at what relative speed the sample is played back, eg. 50% slows the sample down by a factor of 2, 200% speeds up the sample twice. Playback speed affects the pitch of the sample accordingly, slowing the sample down pitches it down, speeding up also pitches up."
  },
  {
    "id": "P_SMP_TIME",
    "min": 0,
    "max": 127,
    "cc": 18,
    "name": "Sample playback time",
    "description": "Determines at what relative speed the sample is played back, but without changing the pitch. As the sample is cut up in miniscule ‘grains’ of audio (milliseconds), Plinky repeats some of these grains to slow down, and leaves some grains out to speed up. Changes in grain size have more drastic effects when samples are stretched severely. "
  },
  {
    "id": "P_SAMPLE",
    "min": 0,
    "max": 127,
    "cc": 82,
    "name": "Sample #",
    "description": "Controls which sample is being played, allowing you to change samples from within a preset by assigning a LFO or CV source to this parameter."
  },
  {
    "id": "P_SEQPAT",
    "min": 0,
    "max": 127,
    "cc": 83,
    "name": "Sequencer pattern #",
    "description": "Controls which sequencer pattern is being played back, allowing you to change patterns from within a preset by assigning an LFO or CV source to this parameter. If you add a slow rising saw to this parameter you can chain various patterns together. "
  },
  {
    "id": "P_JIT_POS",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "Sample position jitter",
    "description": "Adds an amount of randomness to the sample playback position."
  },
  {
    "id": "P_JIT_GRAINSIZE",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "Grain size jitter",
    "description": "Adds an amount of randomness to the sample grain size."
  },
  {
    "id": "P_JIT_RATE",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "Sample speed jitter",
    "description": "Adds an amount of randomness to the sample playback speed."
  },
  {
    "id": "P_JIT_PULSE",
    "min": 0,
    "max": 127,
    "cc": -1,
    "description": "unused parameter slot"
  },
  {
    "id": "P_JIT_UNUSED",
    "min": 0,
    "max": 127,
    "cc": -1,
    "description": "unused parameter slot"
  },
  {
    "id": "P_SEQSTEP",
    "min": 0,
    "max": 127,
    "cc": 85,
    "name": "Pattern offset",
    "description": "Offsets the starting point of the sequencer pattern allowing for variations in sequencer playback."
  },
  {
    "id": "P_ASCALE",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "A scale",
    "description": "An attenuator for the signal coming from the corresponding CV input jacks."
  },
  {
    "id": "P_AOFFSET",
    "min": 0,
    "max": 127,
    "cc": 24,
    "name": "A offset",
    "description": "Offsets the CV and/or LFO. This is a constant voltage that is being added (or subtracted) from the sum of the CV input and the LFO."
  },
  {
    "id": "P_ADEPTH",
    "min": 0,
    "max": 127,
    "cc": 25,
    "name": "A depth",
    "description": "Attenuator for the internal LFO's.The default value is zero so turn this up for LFO's."
  },
  {
    "id": "P_AFREQ",
    "min": 0,
    "max": 127,
    "cc": 26,
    "name": "A rate",
    "description": "Controls the rate of the internal LFO. The LFO rates can range from 20 sceonds (at +100%) to milliseconds at -100%."
  },
  {
    "id": "P_ASHAPE",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "A shape",
    "description": "Sets the shape of the LFO. The following shapes are available; Triangle, Sine, SmthRnd (Smooth Random), StepRnd (Stepped Random), BiSquare (Bipolar Square wave), Square (Unipolar Square wave), Castle (looks like a sandcastle), BiTrigs (Bipolar Trigger pulses), Trigs (Unipolar Trigger Pulses), Env."
  },
  {
    "id": "P_AWARP",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "A warp",
    "description": "Sets the slope of the LFO shape - for example turning a triangle wave into a sharp ramp up (symmetry +100) or down (symmetry -100). "
  },
  {
    "id": "P_BSCALE",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "B scale",
    "description": "An attenuator for the signal coming from the corresponding CV input jacks."
  },
  {
    "id": "P_BOFFSET",
    "min": 0,
    "max": 127,
    "cc": 27,
    "name": "B offset",
    "description": "Offsets the CV and/or LFO. This is a constant voltage that is being added (or subtracted) from the sum of the CV input and the LFO."
  },
  {
    "id": "P_BDEPTH",
    "min": 0,
    "max": 127,
    "cc": 28,
    "name": "B depth",
    "description": "Attenuator for the internal LFO's.The default value is zero so turn this up for LFO's."
  },
  {
    "id": "P_BFREQ",
    "min": 0,
    "max": 127,
    "cc": 29,
    "name": "B rate",
    "description": "Controls the rate of the internal LFO. The LFO rates can range from 20 sceonds (at +100%) to milliseconds at -100%."
  },
  {
    "id": "P_BSHAPE",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "B shape",
    "description": "Sets the shape of the LFO. The following shapes are available; Triangle, Sine, SmthRnd (Smooth Random), StepRnd (Stepped Random), BiSquare (Bipolar Square wave), Square (Unipolar Square wave), Castle (looks like a sandcastle), BiTrigs (Bipolar Trigger pulses), Trigs (Unipolar Trigger Pulses), Env."
  },
  {
    "id": "P_BWARP",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "B warp",
    "description": "Sets the slope of the LFO shape - for example turning a triangle wave into a sharp ramp up (symmetry +100) or down (symmetry -100). "
  },
  {
    "id": "P_XSCALE",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "X scale",
    "description": "An attenuator for the signal coming from the corresponding CV input jacks."
  },
  {
    "id": "P_XOFFSET",
    "min": 0,
    "max": 127,
    "cc": 78,
    "name": "X offset",
    "description": "Offsets the CV and/or LFO. This is a constant voltage that is being added (or subtracted) from the sum of the CV input and the LFO."
  },
  {
    "id": "P_XDEPTH",
    "min": 0,
    "max": 127,
    "cc": 77,
    "name": "X depth",
    "description": "Attenuator for the internal LFO's.The default value is zero so turn this up for LFO's."
  },
  {
    "id": "P_XFREQ",
    "min": 0,
    "max": 127,
    "cc": 76,
    "name": "X rate",
    "description": "Controls the rate of the internal LFO. The LFO rates can range from 20 sceonds (at +100%) to milliseconds at -100%."
  },
  {
    "id": "P_XSHAPE",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "X shape",
    "description": "Sets the shape of the LFO. The following shapes are available; Triangle, Sine, SmthRnd (Smooth Random), StepRnd (Stepped Random), BiSquare (Bipolar Square wave), Square (Unipolar Square wave), Castle (looks like a sandcastle), BiTrigs (Bipolar Trigger pulses), Trigs (Unipolar Trigger Pulses), Env."
  },
  {
    "id": "P_XWARP",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "X warp",
    "description": "Sets the slope of the LFO shape - for example turning a triangle wave into a sharp ramp up (symmetry +100) or down (symmetry -100). "
  },
  {
    "id": "P_YSCALE",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "Y scale",
    "description": "An attenuator for the signal coming from the corresponding CV input jacks."
  },
  {
    "id": "P_YOFFSET",
    "min": 0,
    "max": 127,
    "cc": 81,
    "name": "Y offset",
    "description": "Offsets the CV and/or LFO. This is a constant voltage that is being added (or subtracted) from the sum of the CV input and the LFO."
  },
  {
    "id": "P_YDEPTH",
    "min": 0,
    "max": 127,
    "cc": 80,
    "name": "Y depth",
    "description": "Attenuator for the internal LFO's.The default value is zero so turn this up for LFO's."
  },
  {
    "id": "P_YFREQ",
    "min": 0,
    "max": 127,
    "cc": 79,
    "name": "Y rate",
    "description": "Controls the rate of the internal LFO. The LFO rates can range from 20 sceonds (at +100%) to milliseconds at -100%."
  },
  {
    "id": "P_YSHAPE",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "Y shape",
    "description": "Sets the shape of the LFO. The following shapes are available; Triangle, Sine, SmthRnd (Smooth Random), StepRnd (Stepped Random), BiSquare (Bipolar Square wave), Square (Unipolar Square wave), Castle (looks like a sandcastle), BiTrigs (Bipolar Trigger pulses), Trigs (Unipolar Trigger Pulses), Env."
  },
  {
    "id": "P_YWARP",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "Y warp",
    "description": "Sets the slope of the LFO shape - for example turning a triangle wave into a sharp ramp up (symmetry +100) or down (symmetry -100). "
  },
  {
    "id": "P_MIXSYNTH",
    "min": 0,
    "max": 127,
    "cc": 7,
    "name": "Synth level",
    "description": "Sets the gain level of Plinky's synth / sampler. Above 50% you will start hitting a limiter, which can help to glue patches with wide dynamic range together. You can use this as a volume control if you are taking audio from the left / mono output."
  },
  {
    "id": "P_MIXWETDRY",
    "min": 0,
    "max": 127,
    "cc": 8,
    "name": "Synth wet/dry",
    "description": "Sets the balance between the dry signal of Plinky's voice (synth or sampler) and the wet signal of the Reverb and Delay units (the distortion/saturation device is applied directly to the 8 individual voices.) The default setting is zero where there is an equal mix of wet and dry signals. 100 is completely wet and -100 is completely dry."
  },
  {
    "id": "P_MIXHPF",
    "min": 0,
    "max": 127,
    "cc": 21,
    "name": "HPF",
    "description": "After the synth/sampler, external audio and the effects are mixed, they pass through a High Pass Filter. This parameter controls the cut off frequency."
  },
  {
    "id": "P_MIX_UNUSED",
    "min": 0,
    "max": 127,
    "cc": -1,
    "description": "unused parameter slot"
  },
  {
    "id": "P_CV_QUANT",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "Pitch quantisation",
    "description": "Plinky’s pitch input is most useful when you have a sequence or latched note playing; the pitch is transposed according to the pitch CV input (1 volt per octave), and you can use this last parameter to choose if the transposition is unquantized, quantized to semitones, or transposed in-scale. 0v (C0) means no transposition."
  },
  {
    "id": "P_HEADPHONE",
    "min": 0,
    "max": 127,
    "cc": -1,
    "name": "Headphone level",
    "description": "Sets the level of the final output stage for the headphone out. Turn this up to 11."
  },
  {
    "id": "P_MIXINPUT",
    "min": 0,
    "max": 127,
    "cc": 89,
    "name": "Input level",
    "description": "Sets the gain level of Plinky's inputs. These inputs take line level signals and amplify them to Eurorack levels, but... If you feed it eurorack level, the analog saturation unit in Plinky V2 does it's thing. In case both the inputs on the face plate and the front/back side are used, Plinky mixes the inputs at fixed levels."
  },
  {
    "id": "P_MIXINWETDRY",
    "min": 0,
    "max": 127,
    "cc": 90,
    "name": "Input wet/dry",
    "description": "Sets the balance between the dry signal of the audio inputs and the wet signal passing through the Reverb and Delay units."
  },
  {
    "id": "P_SYS_UNUSED1",
    "min": 0,
    "max": 127,
    "cc": -1,
    "description": "unused parameter slot"
  },
  {
    "id": "P_SYS_UNUSED2",
    "min": 0,
    "max": 127,
    "cc": -1,
    "description": "unused parameter slot"
  },
  {
    "id": "P_SYS_UNUSED3",
    "min": 0,
    "max": 127,
    "cc": -1,
    "description": "unused parameter slot"
  },
  {
    "id": "P_SYS_UNUSED4",
    "min": 0,
    "max": 127,
    "cc": -1,
    "description": "unused parameter slot"
  }
];
