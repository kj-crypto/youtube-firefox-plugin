export class Playlist {
  private name: string;
  private videoIds: string[];

  constructor(name: string, videoIds?: string[]) {
    this.name = name;
    this.videoIds = videoIds || [];
  }

  getName(): string {
    return this.name;
  }

  addVideoId(videId: string): boolean {
    if (this.videoIds.includes(videId)) return false;
    this.videoIds.push(videId);
    return true;
  }

  setVideoIds(videIds: string[]) {
    this.videoIds = videIds;
  }

  getVideoIds() {
    return this.videoIds;
  }

  toJSON() {
    return {
      name: this.name,
      videoIds: this.videoIds,
    };
  }

  static fromJSON(data: {name: string, videoIds: string[]}) {
    return new Playlist(data.name, data.videoIds);
  }
}
