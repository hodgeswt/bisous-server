class EmoteData {
    constructor(data) {
        this.data = data;
    }

    parseData() {
        let intialSplit = this.data.split(',');
        let emote = intialSplit[0].split(':')[1].trim();
        let sender = initialSplit[1].split(':')[1].trim();
        let receiver = initialSplit[2].split(':')[1].trim();
        return {
            emote: emote,
            sender: sender,
            receiver: receiver
        };
    }
}

export default EmoteData;