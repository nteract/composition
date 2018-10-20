// @flow
import { formBinderURL } from "rx-binder";

export default ({ repo, gitref }: *) => formBinderURL({ repo, gitref });
