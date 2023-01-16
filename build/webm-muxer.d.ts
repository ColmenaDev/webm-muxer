/**
 * Describes the properties used to configure an instance of `WebMMuxer`.
 */
declare interface WebMMuxerOptions {
	/**
	 * Specifies where the muxed WebM file is written to.
	 * 
	 * When using `'buffer'`, the muxed file is simply written to a buffer in memory, which is then returned by the
	 * muxer's `finalize` method.
	 * 
	 * If the target is of type `FileSystemWritableFileStream`, the file will be written directly to disk as it is being
	 * muxed. The benefit of this target is the ability to write out very large files, easily exceeding the RAM of the
	 * machine being used.
	 */
	target: 'buffer' | FileSystemWritableFileStream,
	/**
	 * When set, declares the existence of a video track in the WebM file and configures that video track.
	 */
	video?: {
		/**
		 * The codec of the encoded video chunks. Typical video codec strings for WebM are `'V_VP8'`, `'V_VP9'`and
		 * `'V_AV1'`. For a full list of possible codecs, visit https://www.matroska.org/technical/codec_specs.html.
		 */
		codec: string,
		/**
		 * The width of the video, in pixels.
		 */
		width: number,
		/**
		 * The height of the video, in pixels.
		 */
		height: number,
		/**
		 * The frame rate of the video, in frames per second. This property is optional and usually used for metadata
		 * only.
		 */
		frameRate?: number
	},
	/**
	 * When set, declares the existence of an audio track in the WebM file and configures that audio track.
	 */
	audio?: {
		/**
		 * The codec of the encoded audio chunks. Typical audio codec strings for WebM are `'A_OPUS'` and `'A_VORBIS'`.
		 * For a full list of possible codecs, visit https://www.matroska.org/technical/codec_specs.html.
		 */
		codec: string,
		/**
		 * The number of audio channels in the audio track.
		 */
		numberOfChannels: number,
		/**
		 * The sample rate in the audio rate, in samples per second per channel.
		 */
		sampleRate: number,
		/**
		 * The bit depth of the audio track. Optional and typically only required for PCM-coded audio.
		 */
		bitDepth?: number
	}
}

declare global {
	/**
	 * Used to multiplex video and audio chunks into a single WebM file. For each WebM file you want to create, create
	 * one instance of `WebMMuxer`.
	 */
	class WebMMuxer {
		/**
		 * Creates a new instance of `WebMMuxer`.
		 * @param options Specifies configuration and metadata for the WebM file.
		 */
		constructor(options: WebMMuxerOptions);
	
		/**
		 * Adds a new, encoded video chunk to the WebM file.
		 * @param chunk The encoded video chunk. Can be obtained through a `VideoEncoder`.
		 * @param meta The metadata about the encoded video, also provided by `VideoEncoder`.
		 * @param timestamp Optionally, the timestamp to use for the video chunk. When not provided, it will use the one
		 * specified in `chunk`.
		 */
		addVideoChunk(chunk: EncodedVideoChunk, meta: EncodedVideoChunkMetadata, timestamp?: number): void;	
		/**
		 * Adds a new, encoded audio chunk to the WebM file.
		 * @param chunk The encoded audio chunk. Can be obtained through an `AudioEncoder`.
		 * @param meta The metadata about the encoded audio, also provided by `AudioEncoder`.
		 * @param timestamp Optionally, the timestamp to use for the audio chunk. When not provided, it will use the one
		 * specified in `chunk`.
		 */
		addAudioChunk(chunk: EncodedAudioChunk, meta: EncodedAudioChunkMetadata, timestamp?: number): void;

		/**
		 * Adds a raw video chunk to the WebM file. This method should be used when the encoded video is not obtained
		 * through a `VideoEncoder` but through some other means, where no instance of `EncodedVideoChunk`is available.
		 * @param data The raw data of the video chunk.
		 * @param type Whether the video chunk is a keyframe or delta frame.
		 * @param timestamp The timestamp of the video chunk.
		 * @param meta Optionally, any encoder metadata.
		 */
		addVideoChunkRaw(data: Uint8Array, type: 'key' | 'delta', timestamp: number, meta?: EncodedVideoChunkMetadata): void;
		/**
		 * Adds a raw audio chunk to the WebM file. This method should be used when the encoded audio is not obtained
		 * through an `AudioEncoder` but through some other means, where no instance of `EncodedAudioChunk`is available.
		 * @param data The raw data of the audio chunk.
		 * @param type Whether the audio chunk is a keyframe or delta frame.
		 * @param timestamp The timestamp of the audio chunk.
		 * @param meta Optionally, any encoder metadata.
		 */
		addAudioChunkRaw(data: Uint8Array, type: 'key' | 'delta', timestamp: number, meta?: EncodedAudioChunkMetadata): void;

		/**
		 * Is to be called after all media chunks have been added to the muxer. Make sure to call and await the `flush`
		 * method on your `VideoEncoder` and/or `AudioEncoder` before calling this method to ensure all encoding has
		 * finished. This method will then finish up the writing process of the WebM file.
		 * @returns Should you have used `target: 'buffer'` in the configuration options, this method will return the
		 * buffer containing the final WebM file.
		 */
		finalize(): ArrayBuffer | null;
	}
}

export = WebMMuxer;