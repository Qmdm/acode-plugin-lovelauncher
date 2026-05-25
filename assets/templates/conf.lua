require "init"

function love.conf(t)
    t.window.title = GAME_NAME
    t.identity = PKG_NAME
    t.externalstorage = true
end
