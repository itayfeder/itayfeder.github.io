class Element {
    constructor(id, color, x, y) {
        this.Color = color;
        this.Id = id;
        this.CanPassThrough = true;
        this.x = x;
        this.y = y;
        this.Unbrekable = false;
        this.HeatingId = "0";
        this.Flammability = 0.5;
    }

    onTick() {

    }
}

class Empty extends Element {
    constructor(x ,y) {
        super("0", [38, 28, 40, 255], x ,y);
        this.Unbrekable = true;
        this.CanPassThrough = true;
    }
}

class Solid extends Element {
    constructor(id, color, x, y) {
        super(id, color, x ,y);
        this.CanPassThrough = false;
    }
}

class Liquid extends Element {
    constructor(id, color, x, y) {
        super(id, color, x ,y);
    }

    onTick() {
        if (insideGrid(this.y+1)) {
            if (Grid[this.x][this.y+1].CanPassThrough && !(Grid[this.x][this.y+1] instanceof Liquid) && !(Grid[this.x][this.y+1] instanceof Fire)) {
                switchPlaces(this.x, this.y, this.x, this.y+1, this)
            }
        }
        var side = Math.random() < 0.5 ? 1 : -1;
        for (let i = 1; i <= this.dispersionRate; i++) {
            if (insideGrid(this.x+side)) {
                if (Grid[this.x+side][this.y].CanPassThrough) {
                    switchPlaces(this.x, this.y, this.x+side, this.y, this)
                    continue
                }
            }
            break
        }
    }
}

class Gas extends Element {
    constructor(id, color, x, y) {
        super(id, color, x ,y);
    }

    onTick() {
        if (insideGrid(this.y-1)) {
            if (Grid[this.x][this.y-1].CanPassThrough && !(Grid[this.x][this.y-1] instanceof DATA_BY_ID[this.Id])) {
                switchPlaces(this.x, this.y, this.x, this.y-1, this)
            }
        }
        
        var side = Math.random() < 0.5 ? 1 : -1;
        for (let i = 1; i <= this.dispersionRate; i++) {
            if (insideGrid(this.x+side)) {
                if (Grid[this.x+side][this.y].CanPassThrough) {
                    switchPlaces(this.x, this.y, this.x+side, this.y, this)
                    continue
                }
            }
            break
        }
        
    }
}

class Dust extends Solid {
    constructor(id, color, x, y) {
        super(id, color, x ,y);
    }

    onTick() {
        if (this.isFreeFalling) {
            if (insideGrid(this.x+1) && Grid[this.x+1][this.y] instanceof Sand && Math.random() > 0.1) Grid[this.x+1][this.y].isFreeFalling = true;
            if (insideGrid(this.x-1) && Grid[this.x-1][this.y] instanceof Sand && Math.random() > 0.1) Grid[this.x-1][this.y].isFreeFalling = true;
        }
        if (insideGrid(this.y+1)) {
            if (Grid[this.x][this.y+1].CanPassThrough) {
                this.isFreeFalling = true
                switchPlaces(this.x, this.y, this.x, this.y+1, this)
            } else if (this.isFreeFalling) {
                var side = Math.random() < 0.5 ? 1 : -1;
                if (insideGrid(this.x+side)) {
                    if (Grid[this.x+side][this.y+1].CanPassThrough && Grid[this.x+side][this.y].CanPassThrough) {
                        this.isFreeFalling = true
                        switchPlaces(this.x, this.y, this.x+side, this.y+1, this) 
                    }
                }
            }
            
        }
    }
}

class Sand extends Dust {
    constructor(x ,y) {
        super("1", [255, 228, 181, 255], x ,y);
        this.isFreeFalling = false;
    }

    onTick() {
        super.onTick()
        return;
    }
}

class Water extends Liquid {
    constructor(x ,y) {
        super("2", [30, 144, 255, 255], x ,y);
        this.dispersionRate = 2
        this.HeatingId = "3";
    }

    onTick() {
        super.onTick()
        return;
    }
}

class Steam extends Gas {
    constructor(x ,y) {
        super("3", [220, 220, 220, 255], x ,y);
        this.dispersionRate = 2
    }

    onTick() {
        super.onTick()
        return;
    }
}

class Acid extends Liquid {
    constructor(x ,y) {
        super("4", [124, 252, 0, 255], x ,y);
        this.dispersionRate = 1
    }

    onTick() {
        var side = Math.random() < 0.5 ? 1 : -1;
        if (insideGrid(this.x+side)) {
            if (!Grid[this.x+side][this.y].Unbrekable && !(Grid[this.x+side][this.y] instanceof Acid)) {
                Grid[this.x+side][this.y] = new  DATA_BY_ID["0"](this.x+side, this.y)
                Grid[this.x][this.y] = new  DATA_BY_ID["0"](this.x, this.y)
                return;
            }
        }
        if (insideGrid(this.y+1)) {
            if (!Grid[this.x][this.y+1].Unbrekable && !(Grid[this.x][this.y+1] instanceof Acid)) {
                Grid[this.x][this.y+1] = new  DATA_BY_ID["0"](this.x, this.y+1)
                Grid[this.x][this.y] = new  DATA_BY_ID["0"](this.x, this.y)
                return;
            }
        }
        super.onTick()
        return;
    }
}

class Multi extends Solid {
    constructor(x ,y) {
        super("5", [186, 85, 211, 255], x ,y);
        this.replicating = null;
        this.Unbrekable = true;
    }

    onTick() {
        super.onTick();
        if (this.replicating == null) {
            if (insideGrid(this.y-1) && !(Grid[this.x][this.y-1] instanceof Empty) && !(Grid[this.x][this.y-1] instanceof Multi)) {
                this.replicating = DATA_BY_ID[Grid[this.x][this.y-1].Id]
                return;
            }
            if (insideGrid(this.y+1) && !(Grid[this.x][this.y+1] instanceof Empty) && !(Grid[this.x][this.y+1] instanceof Multi)) {
                this.replicating = DATA_BY_ID[Grid[this.x][this.y+1].Id]
                return;
            }
            if (insideGrid(this.x-1) && !(Grid[this.x-1][this.y] instanceof Empty) && !(Grid[this.x-1][this.y] instanceof Multi)) {
                this.replicating = DATA_BY_ID[Grid[this.x-1][this.y].Id]
                return;
            }
            if (insideGrid(this.x+1) && !(Grid[this.x+1][this.y] instanceof Empty) && !(Grid[this.x+1][this.y] instanceof Multi)) {
                this.replicating = DATA_BY_ID[Grid[this.x+1][this.y].Id]
                return;
            }
        }
        else {
            if (insideGrid(this.y-1) && (Grid[this.x][this.y-1] instanceof Empty)) {
                Grid[this.x][this.y-1] = new this.replicating(this.x, this.y-1)
            }
            if (insideGrid(this.y+1) && (Grid[this.x][this.y+1] instanceof Empty)) {
                Grid[this.x][this.y+1] = new this.replicating(this.x, this.y+1)
            }
            if (insideGrid(this.x-1) && (Grid[this.x-1][this.y] instanceof Empty)) {
                Grid[this.x-1][this.y] = new this.replicating(this.x-1, this.y)
            }
            if (insideGrid(this.x+1) && (Grid[this.x+1][this.y] instanceof Empty)) {
                Grid[this.x+1][this.y] = new this.replicating(this.x+1, this.y)
            }
        }
        
    }
}

class Wall extends Solid {
    constructor(x, y) {
        super("6", [170, 74, 68, 255], x, y);
        this.Unbrekable = true;
    }
}

class Fire extends Gas {
    constructor(x, y) {
        super("7", [252, 116, 5, 255], x, y);
        this.dispersionRate = 1
        this.dissipationTime = 5;
        this.riseUp = false;
    }

    onTick() {
        if (this.dissipationTime <= 0) {
            Grid[this.x][this.y] = new DATA_BY_ID["0"](this.x, this.y)
            return;
        }
        if (this.dissipationTime == 3)
            this.Color = [84, 84, 79, 255]
        let burned = false;
        if (insideGrid(this.y-1) && !Grid[this.x][this.y-1].Unbrekable && !(Grid[this.x][this.y-1] instanceof Fire) && Math.random() > Grid[this.x][this.y-1].Flammability) {
            Grid[this.x][this.y-1] = new DATA_BY_ID[Grid[this.x][this.y-1].HeatingId](this.x, this.y-1)
            burned = true;
        }
        if (insideGrid(this.y+1) && !Grid[this.x][this.y+1].Unbrekable && !(Grid[this.x][this.y+1] instanceof Fire) && Math.random() > Grid[this.x][this.y-1].Flammability) {
            Grid[this.x][this.y+1] = new DATA_BY_ID[Grid[this.x][this.y+1].HeatingId](this.x, this.y+1)
            burned = true;
        }
        if (insideGrid(this.x-1) && !Grid[this.x-1][this.y].Unbrekable && !(Grid[this.x-1][this.y] instanceof Fire) && Math.random() > Grid[this.x][this.y-1].Flammability) {
            Grid[this.x-1][this.y] = new DATA_BY_ID[Grid[this.x-1][this.y].HeatingId](this.x-1, this.y)
            burned = true;
        }
        if (insideGrid(this.x+1) && !Grid[this.x+1][this.y].Unbrekable && !(Grid[this.x+1][this.y] instanceof Fire) && Math.random() > Grid[this.x][this.y-1].Flammability) {
            Grid[this.x+1][this.y] = new DATA_BY_ID[Grid[this.x+1][this.y].HeatingId](this.x+1, this.y)
            burned = true;
        }
        if (burned) {
            Grid[this.x][this.y] = new DATA_BY_ID["0"](this.x, this.y)
            this.dispersionRate = 0;
        }

        super.onTick()
        this.dissipationTime--;
        return;
    }
}

class Oil extends Liquid {
    constructor(x ,y) {
        super("8", [73, 76, 79, 255], x ,y);
        this.dispersionRate = 2
        this.HeatingId = "7";
    }

    onTick() {
        if (insideGrid(this.y-1)) {
            if (Grid[this.x][this.y-1] instanceof Water) {
                switchPlaces(this.x, this.y, this.x, this.y-1, this)
            }
        }
        super.onTick()
        return;
    }
}