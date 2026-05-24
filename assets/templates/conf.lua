-- Conf Constants
GAME_NAME = "Template Game"
PKG_NAME = "com.example.mygame"

function love.conf(t)
    t.window.title = GAME_NAME
    t.identity = PKG_NAME
    t.externalstorage = true
end
