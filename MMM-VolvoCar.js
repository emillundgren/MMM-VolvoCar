Module.register("MMM-VolvoCar", {
    defaults: {
      text:   "Loading...",
      client_id: null,
      client_secret: null,
    },
  
    start: function () {
      Log.info(this.name + ' is starting');
      this.sendSocketNotification('SET_CONFIG', this.config);
    },
  
    socketNotificationReceived: function (notification, payload) {
      if (notification === 'SHOW_LOGIN') {
        Log.log("SHOW_LOGIN IN MAIN MODULE")
      }
      else if (notification === 'MODULE_READY') {
        Log.log("MODULE_READY IN MAIN MODULE");
        this.sendSocketNotification('GET_CAR_DATA',this.config.text);
      }
      else if (notification === 'UPDATE_DATA_ON_MM') {
        var self = this;
        var jsonData = JSON.parse(payload);
        this.config.text = jsonData.data.id;
        self.updateDom();
      }
    },
  
    getDom: function () {
      var wrapper = document.createElement("div");
      wrapper.innerHTML = this.config.text;
      return wrapper;
    },
  });