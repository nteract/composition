The `<Kernel />` component is a provider and consumer pair for getting access to a kernel

```js
var _ = require("lodash");
var { first, map } = require("rxjs/operators");

var transforms = require("../../../transforms");
var messaging = require("../../../messaging");

class FakeBook extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      source: `print("Super DATA ANALYSIS MEGA DOME")

library(ggplot2)

cars <- data.frame(mtcars)

# create factors with value labels
cars$gear <- factor(cars$gear,levels=c(3,4,5),
  	labels=c("3gears","4gears","5gears"))
cars$am <- factor(cars$am,levels=c(0,1),
  	labels=c("Automatic","Manual"))
cars$cyl <- factor(cars$cyl,levels=c(4,6,8),
   labels=c("4cyl","6cyl","8cyl"))


# Kernel density plots for mpg# Kerne
# grouped by number of gears (indicated by color)
qplot(mpg, data=cars, geom="density", fill=gear, alpha=I(.5),
  main="Distribution of Gas Milage", xlab="Miles Per Gallon",
  ylab="Density")`,
      messageCollections: {}
    };
  }

  getKernelInfo() {
    // Set up a receiver for kernel info
    let kernelInfo = null;
    this.props.kernel.channels
      .pipe(
        messaging.ofMessageType("kernel_info_reply"),
        first(),
        map(msg => msg.content)
      )
      .subscribe(content => {
        kernelInfo = content;
      });

    var intervalId;
    intervalId = setInterval(() => {
      if (kernelInfo) {
        clearInterval(intervalId);
        return;
      }
      this.props.kernel.channels.next(messaging.kernelInfoRequest());
    }, 300);
  }

  componentDidMount() {
    this.subscription = this.props.kernel.channels.subscribe(
      msg => {
        if (msg.parent_header && typeof msg.parent_header.msg_id === "string") {
          const parent_id = msg.parent_header.msg_id;

          // Collect all messages
          const messages = _.get(this.state.messageCollections, parent_id, []);
          messages.push(msg);
          this.setState({
            messageCollections: {
              ...this.state.messageCollections,
              [parent_id]: messages
            }
          });
        }
      },
      err => console.error(err)
    );

    this.getKernelInfo();
  }

  render() {
    return (
      <>
        <textarea
          style={{
            border: "none",
            width: "100%",
            height: "320px",
            fontSize: ".9em",
            fontFamily: `SFMono-Regular, Menlo, Consolas, "Liberation Mono", "Courier New", monospace`
          }}
          onChange={event => {
            this.setState({ source: event.target.value });
          }}
          value={this.state.source}
        />
        <hr />
        <button
          onClick={() => {
            this.props.kernel.channels.next(
              messaging.executeRequest(this.state.source)
            );
          }}
        >
          Execute
        </button>
        <button
          onClick={() => {
            this.setState({ messageCollections: {} });
          }}
        >
          Clear Outputs
        </button>
        {_.map(this.state.messageCollections, (collection, parent_id) => {
          return _.map(collection, msg => {
            switch (msg.msg_type) {
              case "execute_result":
              case "display_data":
                if (msg.content.data) {
                  const mimetype = transforms.richestMimetype(msg.content.data);
                  if (!mimetype) {
                    return null;
                  }
                  const Transform = transforms.transforms[mimetype];

                  return (
                    <Transform
                      key={msg.header.msg_id}
                      data={msg.content.data[mimetype]}
                    />
                  );
                }
              case "stream":
                return <pre key={msg.header.msg_id}>{msg.content.text}</pre>;
              default:
                return null;
            }
          });
        })}
      </>
    );
  }
}

<Kernel repo="binder-examples/r" kernelName="ir">
  <Kernel.Consumer>
    {kernel =>
      kernel ? <FakeBook kernel={kernel} /> : <pre>Allocating Kernel</pre>
    }
  </Kernel.Consumer>
</Kernel>;
```
