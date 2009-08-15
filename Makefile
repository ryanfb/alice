BUILD := data/static
SOURCE := data/sprockets
INCLUDES := $(SOURCE)/alice/src $(SOURCE)/prototype/src $(SOURCE)/scriptaculous/src
INCLUDE := $(foreach dir,$(INCLUDES),-I $(dir))
JAVASCRIPT_SOURCES := $(foreach dir,$(INCLUDES),$(wildcard $(dir)/*.js))

SITE_JS := $(BUILD)/site.js
ALICE_JS := $(SOURCE)/alice/src/alice.js

define build_submodules
	git submodule init
	git submodule update
endef

all: $(SITE_JS)

$(SITE_JS): $(JAVASCRIPT_SOURCES) submodules
	sprocketize $(INCLUDE) $(ALICE_JS) > $@

$(SOURCE)/prototype/.git/refs/heads/master:
	$(build_submodules)
$(SOURCE)/scriptaculous/.git/refs/heads/master:
	$(build_submodules)

submodules: $(SOURCE)/prototype/.git/refs/heads/master $(SOURCE)/scriptaculous/.git/refs/heads/master

clean:
	rm -f $(SITE_JS)
