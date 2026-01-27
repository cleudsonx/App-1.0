import org.junit.platform.runner.JUnitPlatform;
import org.junit.platform.suite.api.SelectClasses;
import org.junit.runner.RunWith;

import validation.validation.InputValidatorTest;

@RunWith(JUnitPlatform.class)
@SelectClasses({
    validation.InputValidatorTest.class
})
public class AllTests {
}