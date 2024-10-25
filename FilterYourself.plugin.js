/**
 * @name FilterYourself
 * @author copperfork
 * @description Stop yourself from saying specific words! USAGE: change the default settings to 
 * words you want to censor with comma-separated values! Example: poop,stupid,impostor
 * @version 1
 */

module.exports = class FilterYourself {

    constructor() {
      this.patcher = null;
    }

    start() {

    const BD = new BdApi("FilterYourself");
    const { Filters, getModule } = BD.Webpack;

    const MessageActionsFilter = Filters.byKeys("jumpToMessage", "sendMessage");
    const MessageActions = getModule(m => MessageActionsFilter(m));

    let loadFilteredWords = []
    
    this.patcher = BD.Patcher.instead(MessageActions, "sendMessage", (_this, [_, msg], originalFunc) => {
      // load and check
      loadFilteredWords = BdApi.Data.load("FilterYourself", "filteredWords")
      if (!loadFilteredWords){return originalFunc(_, msg)}
      // console.log("Loaded filtered words: " + loadFilteredWords)

      const message = msg.content
      const words = message.split(" ")
      for (let i = 0; i < words.length; i++)
      {
        if (loadFilteredWords.includes(words[i].toLowerCase()))
        {
          BD.UI.showConfirmationModal(
            "Filtered Word Detected",
            "Looks like you're using the banned word '" + words[i] + "' In your message. Are you sure you want to send?",
            {
                confirmText: "Im sure",
                cancelText: "Nevermind",
                onConfirm: () => originalFunc(_, msg),
                onCancel: () => console.log("Cancelled")
            }
          );
          return;
        }
      }
      return originalFunc(_, msg)
    });
  } 
    stop() {
      if (this.patcher)
      {
        this.patcher();
        this.patcher = null;
      }
    }

    getSettingsPanel() {
      const R = BdApi.React
      const CE = R.createElement

      let mySettings = {
        filteredWords: []
      }

      function SettingsPanel() {
        const headerStyle = {
          color: 'white'
        }
        const inputStyle = { 
          backgroundColor: 'var(--background-tertiary)',
          borderRadius: '3px',
          borderStyle: 'none',
          height: '2rem',
          minWidth: '100%',
          color: 'white'
        };
        const textStyle = {
          color: 'white'
        }

        const SettingsHandler = () => {
          let newWords = []
          const words = document.querySelector("#FilterYourself-words").value.split(",")
          for (const word of words)
          {
            console.log(word)
            newWords.push(word.toLowerCase())
          }
          mySettings.filteredWords = newWords
          BdApi.Data.save("FilterYourself", "filteredWords", mySettings.filteredWords)
          // console.log(BdApi.Data.load("FilterYourself", "filteredWords"))

          let labelText = document.querySelector("#FilterYourself-label")
          labelText.innerHTML = "Your banned words: " + newWords
        }

        function ValueGetter() {
          let string = []
          const loadwords = BdApi.Data.load("FilterYourself", "filteredWords")
          if (loadwords)
          {
            for (const word of loadwords)
            {
              string += word + " "
              console.log(word)
            }
            return string
          }
        }

          return CE("div", {id: "settingsmenu"}, 
            CE("h1", {style: headerStyle}, "Filtered Words"),
            CE("textarea", {id: "FilterYourself-words", style: inputStyle, placeholder: "Comma-separated Values here"}),
            CE("div", {id: "FilterYourself-label", style: textStyle}, "Your banned words: " + ValueGetter()),
            CE("button", {onClick: SettingsHandler}, "Submit")
          )
      }
      return SettingsPanel;
    }
}