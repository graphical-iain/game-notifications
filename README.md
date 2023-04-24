# FPS Notifications

Website written with React & allowing for CSV uploads in the following format:

`<Text>,<Priority>,<Duration>,<Start Time>`

e.g.
> Headshot,3,200,2000


<br>

### Working Example
[iain.design/demos/game-notifications](https://iain.design/demos/game-notifications/)

### Notes

- I used the base setup from create-react-app.

- My test data CSV is located in /src/assets

- I made the prominence of the messages much more than what it would be if they were in a full HUD.

- I assumed there would be no header row in the CSV, but if it’s included it will be ignored.